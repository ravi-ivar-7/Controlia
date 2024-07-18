require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);
const fs = require('fs');
const tar = require('tar-stream');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });
const stream = require('stream');
const path = require('path');


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

        return `${fileName} saved.`;
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
        return `${filePath} deleted.`;
    }
    catch (error) {
        console.error(`Failed to delete file '${filePath}' to container '${containerId}': ${error}`);
        throw error;
    }
}



// Function to retrieve a file from a Docker container
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

async function saveFileToContainer1(containerId, dirPath, fileName, fileContent) {
    const container = docker.getContainer(containerId);

    // Ensure directory exists
    await createDirectory(container, dirPath);

    // Create tar stream
    const pack = tar.pack();

    pack.entry({ name: `${dirPath}/${fileName}` }, fileContent);
    pack.finalize();

    const tarStream = new stream.PassThrough();
    pack.pipe(tarStream);

    // Upload the tar stream to the container
    return new Promise((resolve, reject) => {
        container.putArchive(tarStream, { path: dirPath }, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}



async function createFile(container, dirPath, fileName, fileContent) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(dirPath, fileName);
        const writeStream = fs.createWriteStream(filePath, { flags: 'w' });
        writeStream.write(fileContent);
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}


async function getFileFromContainer(containerId, filePath) {
    const container = docker.getContainer(containerId);
    const extract = tar.extract();

    return new Promise((resolve, reject) => {
        const chunks = [];

        extract.on('entry', function (header, stream, next) {
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            stream.on('end', function () {
                next(); // ready for next entry
            });
            stream.resume(); // just auto drain the stream
        });

        extract.on('finish', function () {
            // all entries read
            const fileContent = Buffer.concat(chunks);
            resolve(fileContent.toString());
        });

        container.getArchive({ path: filePath }, function (err, stream) {
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





module.exports = { saveFileToContainer, getFileFromContainer, deleteFileFromContainer, getFilesFromContainer };
