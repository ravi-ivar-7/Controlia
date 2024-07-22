
const path = require('path');
const fs = require('fs');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const startJupyterServer = async (containerId, notebookDirectory) => {
  const container = docker.getContainer(containerId);
  try {
    let exec = await container.exec({
      Cmd: ['mkdir', '-p', notebookDirectory],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    });

    let response = await exec.start({ hijack: true });

    response.on('data', (data) => {
      console.log(data.toString());
    });

    response.on('error', (error) => {
      console.error(error.toString());
    });

    await new Promise((resolve) => {
      response.on('end', resolve);
    });

    exec = await container.exec({
      Cmd: ['jupyter', 'notebook', '--no-browser', '--ip=0.0.0.0', '--port=8881', '--notebook-dir=' + notebookDirectory, '--allow-root'],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    });

    response = await exec.start({ hijack: true });

    let token;
    response.on('data', (data) => {
      const output = data.toString();
      console.log(`${output}`);
      const tokenMatch = output.match(/token=([a-f0-9]{32})/);
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    });

    response.on('error', (error) => {
      console.error(error.toString());
    });

    await new Promise((resolve) => {
      response.on('end', resolve);
    });

    if (!token) {
      throw new Error('Failed to retrieve Jupyter token.');
    }

    return { message: `Jupyter server for container ${containerId} started`, token };

  } catch (error) {
    console.error(`Failed to start Jupyter server for '${containerId}': ${error}`);
    throw error;
  }
}

module.exports = { startJupyterServer };
