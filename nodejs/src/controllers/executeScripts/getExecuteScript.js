require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const logger = require('../../services/winstonLogger');

const getExecuteScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);

  try {
    const { decodedToken } = req.body;

    await client.connect();
    const db = client.db("controlia");
    const scriptCollection = db.collection('executeScripts');


    const scripts = await scriptCollection.find({ userId: decodedToken.userId }).toArray() || []
    return res.status(200).json({info:'Fetched execute scripts', scripts });

  } catch (error) {
    logger.error(`ERROR IN GETING EXECUTE SCRIPT: ${error}`);
    return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { getExecuteScript };
