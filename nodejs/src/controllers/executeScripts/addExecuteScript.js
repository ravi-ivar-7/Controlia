require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const {  base62 } = require('base-id');

const addExecuteScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { scriptInfo, decodedToken } = req.body;
    if(!scriptInfo){
      return res.status(422).json({info:'scriptInfo is missing in body.'})
    }
    await client.connect();
    const db = client.db("controlia");
    const scriptCollection = db.collection('executeScripts');

    const scriptId = await base62.generateToken(24, 'es_');

    const newScript = {
      userId: decodedToken.userId,
      email:decodedToken.email,
      name:decodedToken.name,
      scriptId: scriptId,
      title: scriptInfo.title,
      language: scriptInfo.language,
      script: scriptInfo.script,
      argumentsList:scriptInfo.argumentsList,
      scheduleId: '',
      deployId:'',
      date: new Date(),
    };
    await scriptCollection.insertOne(newScript);
    return res.status(200).json({message:`${scriptId} added.`, newScript}); 
  } catch (error) {
    console.error('ERROR IN ADDING EXECUTION SCRIPT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { addExecuteScript };
