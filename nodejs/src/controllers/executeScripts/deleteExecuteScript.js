require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/winstonLogger')

const deleteExecuteScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { decodedToken, scriptInfo } = req.body;
    if (!scriptInfo) {
      return res.status(209).json({ warn: 'scriptInfo is missing in body.' });
    }

    await client.connect();
    const db = client.db("controlia");
    const scriptCollection = db.collection('executeScripts');

    const result = await scriptCollection.findOneAndDelete({
      userId: decodedToken.userId,
      scriptId: scriptInfo.scriptId
    });

    return res.status(200).json({ info: `Successfully deleted ${scriptInfo.scriptId}` });

  } catch (error) {
    logger.error(`ERROR IN DELETING EXECUTION SCRIPT: ${error}`);
    return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
  }
};

module.exports = {
  deleteExecuteScript
};
