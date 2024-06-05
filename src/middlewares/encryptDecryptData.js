const crypto = require('crypto');
const fs = require('fs').promises;
require('dotenv').config({path:'./config/keys/.env'});

async function readKeys() {
    try {
        const [privateKey, publicKey] = await Promise.all([
            fs.readFile('privateKey.pem', 'utf8'),
            fs.readFile('publicKey.pem', 'utf8')
        ]);
        return { privateKey, publicKey };
    } catch (err) {
        console.error('ERROR READING FILES: ', err);
        return { privateKey: null, publicKey: null };
    }
}

function encryptData(password, publicKey) {
    const buffer = Buffer.from(password, 'utf-8');
    return crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, buffer).toString('base64');
}

function decryptData(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, 'base64');
    return crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, buffer).toString('utf-8');
}

module.exports = { readKeys, encryptData, decryptData };
