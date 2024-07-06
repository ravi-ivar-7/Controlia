require('dotenv').config({path:'../../config/env/.env'});
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config({path:'./config/keys/.env'});

const uri = process.env.MONGODB_URI;

async function connectToSchemaLessDatabase(databaseName, collectionName) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return { client, collection };
  } catch (error) {
    console.error('ERROR CONECTING TO SCHEMALESS DATABASE: ', error);
    throw error;
  }
}

const connectToSchemaDatabase = async (mongoURI) => {
  try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
  } catch (error) {
    console.error('ERROR CONNECTING TO SCHEMA DATABASE: ', error);
    throw error;
  }
};


module.exports = { connectToSchemaLessDatabase,connectToSchemaDatabase };
