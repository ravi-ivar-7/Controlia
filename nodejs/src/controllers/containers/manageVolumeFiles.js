const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const {getFileFolderFromContainer, deleteFileFromContainer, createArchive} = require('../../services/docker/manageVolumeFiles')

const parseLsOutput = (output) => {
  const lines = output.split('\n');
  const root = {};
  let currentDir = root;
  const stack = [root];

  lines.forEach(line => {
    // Trim any whitespace or special characters from the line
    const cleanedLine = line.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    if (cleanedLine.endsWith(':')) {
      const dirName = cleanedLine.slice(0, -1);
      const newDir = {};
      currentDir[dirName] = newDir;
      stack.push(currentDir);
      currentDir = newDir;
    } else if (cleanedLine === '' && stack.length > 1) {
      currentDir = stack.pop();
    } else if (cleanedLine) {
      currentDir[cleanedLine] = null;
    }
  });

  return root;
};


const getWorkspaceFiles = async (req, res) => {
  let client;
  try {
    const { decodedToken } = req.body;
    client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db("controlia");
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ userId: decodedToken.userId })

    const container = docker.getContainer(user.containerId);

    let exec = await container.exec({
      Cmd: ['ls', '-R', `/${user.userId}`],
      AttachStdout: true,
      AttachStderr: true,
    });

    let stream = await exec.start({ hijack: true });

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.on('error', (error) => {
      output += error.toString();
    });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const workspaceFiles = parseLsOutput(output);

    return res.status(200).json({ info: 'successfully fetched workspace files.', workspaceFiles })
  } catch (error) {
    return res.status(500).json({ warn: `Error getting files ${error}` })
  }
}

const downloadVolumeData = async (req, res) => {
  let client;
  try {
    const { decodedToken, path } = req.body;
    client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db("controlia");
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ userId: decodedToken.userId });

   // Remove everything before userId
   const userIdIndex = path.indexOf(user.userId);
   const updatedPath = userIdIndex !== -1 ? path.slice(userIdIndex - 1) : path; // `-1` to include leading '/'

    const data = await getFileFolderFromContainer(user.containerId, updatedPath);

    const archiveStream = await createArchive(data);

    res.setHeader('Content-Disposition', `attachment; filename=${user.userId}-data.zip`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe the archive stream to the response
    archiveStream.pipe(res).on('finish', () => {
      // console.log('Archive successfully sent.');
    }).on('error', (err) => {
      console.error('Error sending archive:', err);
      res.status(500).json({ warn: `Error sending archive ${err}` });
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ warn: `Error getting files ${error}` });
  } finally {
    if (client) {
      await client.close();
    }
  }
};



module.exports = { getWorkspaceFiles, downloadVolumeData }
