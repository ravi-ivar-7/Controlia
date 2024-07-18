require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);
const fs = require('fs');
const tar = require('tar-stream');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const stream = require('stream');
const path = require('path');
const { json } = require('body-parser');

const archiver = require('archiver');

const createArchive = async (data) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const passthrough = new stream.PassThrough();
  
      archive.on('error', (err) => reject(err));
      archive.pipe(passthrough);
  
      const addFilesToArchive = async (currentData, currentPath) => {
        for (const [key, value] of Object.entries(currentData)) {
          const newPath = currentPath ? `${currentPath}/${key}` : key;
          if (value && typeof value === 'object') {
            await addFilesToArchive(value, newPath);
          } else {
            archive.append(value, { name: newPath });
          }
        }
      };
  
      addFilesToArchive(data, '').then(() => {
        archive.finalize();
      }).catch((err) => reject(err));
  
      resolve(passthrough);
    });
  };



const saveFileToContainer = async (containerId, fileDir, fileName, fileContent) => {
    const container = docker.getContainer(containerId);

    try {

        let exec = await container.exec({
            Cmd: ['mkdir', '-p', fileDir],
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

        // Create a tar stream for the file to be copied
        const pack = tar.pack();

        // Add the file to the tar stream
        pack.entry({ name: fileName }, fileContent, () => {
            pack.finalize();
        });

        // Create a stream that Dockerode can use
        const tarStream = new stream.PassThrough();
        pack.pipe(tarStream);

        // Upload the tar archive to the container
        await container.putArchive(tarStream, { path: fileDir });

        return  json({info: `${fileName} saved.`});

    } catch (error) {
        console.error(`Failed to save file '${fileName}' to container '${containerId}': ${error}`);
        throw error;
    }
}

async function deleteFileFromContainer(containerId, filePath) {
    const container = docker.getContainer(containerId);
    try {
        const exec = await container.exec({
            Cmd: ['sudo', 'rm', '-f', filePath],
            AttachStdout: true,
            AttachStderr: true,
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
        return json({info:`${filePath} deleted.` });
    }
    catch (error) {
        console.error(`Failed to delete file '${filePath}' to container '${containerId}': ${error}`);
        throw error;
    }
}

async function getFileFromContainerAndSave(containerId, containerFilePath, localDestPath) {
    const container = docker.getContainer(containerId);

    // Get a tar stream of the file from the container
    const stream = await container.getArchive({ path: containerFilePath });

    // Extract the file from the tar stream
    const extract = tar.extract();
    extract.on('entry', (header, stream, next) => {
        if (header.type === 'file') {
            const filePath = `${localDestPath}/${header.name}`;
            stream.pipe(fs.createWriteStream(filePath));
        }
        stream.on('end', next);
        stream.resume();
    });
    stream.pipe(extract);
}

async function getFileFolderFromContainer(containerId, path) {
    const container = docker.getContainer(containerId);
    const extract = tar.extract();

    return new Promise((resolve, reject) => {
        const chunks = [];
        const fileStructure = {};

        extract.on('entry', function (header, stream, next) {
            const fullPath = header.name;
            const paths = fullPath.split('/');
            let currentDir = fileStructure;

            // Traverse the structure and create directories as needed
            for (let i = 0; i < paths.length - 1; i++) {
                const part = paths[i];
                if (!currentDir[part]) {
                    currentDir[part] = {};
                }
                currentDir = currentDir[part];
            }

            if (header.type === 'file') {
                // Collect file content
                const fileName = paths[paths.length - 1];
                const fileChunks = [];
                stream.on('data', (chunk) => {
                    fileChunks.push(chunk);
                });
                stream.on('end', function () {
                    currentDir[fileName] = Buffer.concat(fileChunks).toString();
                    next(); // ready for next entry
                });
            } else {
                stream.resume(); // just auto drain the stream for directories
                next();
            }
        });

        extract.on('finish', function () {
            // all entries read
            resolve(fileStructure);
        });

        container.getArchive({ path: path }, function (err, stream) {
            if (err) {
                return reject(err);
            }
            stream.pipe(extract);
        });
    });
}


async function getFilesFromContainer(containerId, dirpath) {
    const container = docker.getContainer(containerId);
    const extract = tar.extract();
    const scripts = [];

    extract.on('entry', (header, fileStream, next) => {
        if (header.type === 'file') {
            let fileContent = '';
            fileStream.on('data', (chunk) => {
                fileContent += chunk.toString();
            });
            fileStream.on('end', () => {
                scripts.push({ name: header.name, content: fileContent });
                next();
            });
        } else {
            fileStream.resume();
            next();
        }
    });

    return new Promise((resolve, reject) => {
        container.getArchive({ path: dirpath }, (err, tarStream) => {
            if (err) {
                return reject(err);
            }

            tarStream.pipe(extract);

            extract.on('finish', () => {
                resolve(scripts);
            });

            extract.on('error', (err) => {
                reject(err);
            });
        });
    });
}





module.exports = { saveFileToContainer, getFileFolderFromContainer, deleteFileFromContainer, getFilesFromContainer ,createArchive};
