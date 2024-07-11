require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');


const deleteExecuteScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { decodedToken, scriptInfo } = req.body;
    if (!scriptInfo) {
      return res.status(422).json({ info: 'scriptInfo is missing in body.' });
    }

    await client.connect();
    const db = client.db("controlia");
    const scriptCollection = db.collection('executeScripts');

    const result = await scriptCollection.findOneAndDelete({
      userId: decodedToken.userId,
      scriptId: scriptInfo.scriptId
    });

    // if (!result.value) {
    //   return res.status(404).json({ message: `Script with ID ${scriptInfo.scriptId} not found` });
    // }

    // const scripts = await scriptCollection.find({ userId: decodedToken.userId, type: 'simple' }).toArray();

    return res.status(200).json({ message: `Successfully deleted ${scriptInfo.scriptId}` });

  } catch (error) {
    console.error('ERROR IN DELETING EXECUTION SCRIPT:', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  }
};

module.exports = {
  deleteExecuteScript
};
