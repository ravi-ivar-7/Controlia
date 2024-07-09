const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');
const { verifyToken } = require('../../middlewares/verifyToken');

const deleteExecuteScript = async (req, res) => {
  let client;

  try {
    const { decodedToken, scriptInfo } = req.body;

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executionscript');
    client = dbClient;

    const result = await collection.findOneAndDelete({
      userId: decodedToken.userId,
      type: 'executionscript',
      scriptId: scriptInfo.scriptId
    });

    const scripts = await collection.find({ userId: decodedToken.userId, type: 'executionscript' }).toArray() || [];

    res.status(200).json({ scripts });

  } catch (error) {
    console.error('ERROR IN DELETE EXECUTION SCRIPT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  deleteExecuteScript
};
