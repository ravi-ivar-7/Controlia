const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const getExecuteScript = async (req, res) => {
  let client;

  try {
    const {decodedToken} = req.body;

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'scripts');
    client = dbClient;


    const scripts = await collection.find({ userId: decodedToken.userId, type: 'scripts' }).toArray() || []

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
  getExecuteScript
 };
