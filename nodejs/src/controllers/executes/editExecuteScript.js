const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const editExecuteScript = async (req, res) => {
  let client;

  try {
    const { scriptInfo, decodedToken } = req.body;
    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'scripts');
    client = dbClient;

    const updateFields = {
      $set: {
        title: scriptInfo.title,
        language: scriptInfo.language,
        script: scriptInfo.script,
        date: new Date(),
      }
    };
    
    const updatedScript = await collection.findOneAndUpdate(
      { userId: decodedToken.userId, scriptId: scriptInfo.scriptId },
      updateFields,
      { returnDocument: 'after' }
    );

    res.status(200).json({ updatedScript });

  } catch (error) {
    console.error('ERROR IN EDIT EXECUTION SCRIPT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { editExecuteScript };
