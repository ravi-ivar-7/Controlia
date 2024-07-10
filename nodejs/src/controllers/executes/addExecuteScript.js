const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const addExecuteScript = async (req, res) => {
  let client;

  try {

    const { scriptInfo, decodedToken } = req.body;
    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'scripts');
    client = dbClient;

    const newScript = {
      type: 'scripts',
      userId: decodedToken.userId,
      scriptId: scriptInfo.scriptId,
      title: scriptInfo.title,
      language: scriptInfo.language,
      script: scriptInfo.script,
      argumentsList:scriptInfo.argumentsList,
      schedule:'',
      scheduleType:'',
      scheduleJobName:'',
      date: new Date(),

    };

    await collection.insertOne(newScript);

    const scripts = await collection.find({ userId: decodedToken.userId, type: 'scripts' }).toArray() || [];
    
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
