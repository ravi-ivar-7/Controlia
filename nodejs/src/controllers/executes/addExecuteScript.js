const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const addExecuteScript = async (req, res) => {
  let client;

  try {


    // If you are expecting form data, it will be in req.body (assuming body-parser is used)
    const { scriptInfo, decodedToken } = req.body;
    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executionscript');
    client = dbClient;

    // Create the new script object
    const newScript = {
      type: 'executionscript',
      userId: decodedToken.userId,
      scriptId: scriptInfo.scriptId,
      title: scriptInfo.title,
      language: scriptInfo.language,
      script: scriptInfo.script,
      date: new Date(),

    };

    await collection.insertOne(newScript);

    const scripts = await collection.find({ userId: decodedToken.userId, type: 'executionscript' }).toArray() || [];
    // console.log(scripts)
    res.status(200).json({newScript}); 

  } catch (error) {
    console.error('ERROR IN ADD EXECUTION SCRIPT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { addExecuteScript };
