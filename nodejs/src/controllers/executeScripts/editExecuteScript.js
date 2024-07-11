require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const editExecuteScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);

  try {
    const { scriptInfo, decodedToken } = req.body;
    if(!scriptInfo){
      return res.status(209).json({info:'scriptInfo is missing in body.'})
    }

    await client.connect();
    const db = client.db("controlia");
    const scriptCollection = db.collection('executeScripts');

    const updateFields = {
      $set: {
        title: scriptInfo.title,
        language: scriptInfo.language,
        script: scriptInfo.script,
        argumentsList:scriptInfo.argumentsList,
        date: new Date(),
      }
    };
    
    const updatedScript = await scriptCollection.findOneAndUpdate(
      { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
      updateFields,
      { returnDocument: 'after' }
    );

    return res.status(200).json({message:`Successfully updated ${scriptInfo.scriptId}`, updatedScript });

  } catch (error) {
    console.error('ERROR IN EDITING EXECUTION SCRIPT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { editExecuteScript };
