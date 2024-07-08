const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');
const {verifyToken} = require('../../middlewares/verifyToken')

const getExecutionScript = async (req, res) => {
  let client;

  try {
    const {decodedToken} = req.body;

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executionscript');
    client = dbClient;


    const scripts = await collection.find({ userId: decodedToken.userId, type: 'executionscript' }).toArray() || []

    res.status(200).json({scripts}); 

  } catch (error) {
    console.error('ERROR IN GET EXECUTION SCRIPT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { 
  getExecutionScript
 };
