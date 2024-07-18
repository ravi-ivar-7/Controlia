require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { saveFileToContainer } = require('../../services/docker/manageVolumeFiles')
const { base62 } = require('base-id');

const logger = require('../../services/logs/winstonLogger');

const extension = { 'python': 'py', 'cpp': 'cpp', 'shell': 'sh', 'javascript': 'js' };
function getScriptNameWithExtension(scriptName, language) {
  const scriptNameWithoutExtension = scriptName.replace(/\.[^/.]+$/, ""); // Remove existing extension
  const newExtension = extension[language];
  return `${scriptNameWithoutExtension}.${newExtension}`;
}

const saveScript = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { script, decodedToken } = req.body;
    if (!script) {
      return res.status(209).json({ warn: 'scriptInfo is missing in body.' });
    }
    await client.connect();
    const db = client.db("controlia");
    const usersCollection = db.collection('users');
    const scriptsCollection = db.collection('scripts');

    const user = await usersCollection.findOne({ userId: decodedToken.userId })
    const scriptName = getScriptNameWithExtension(script.scriptName, script.language)

    let scriptId = await base62.generateToken(24, 'spt_');

    const newScript = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      name: decodedToken.name,

      scriptId:scriptId,

      scriptName: scriptName,
      language: script.language,
      argumentList: script.argumentList,

      scheduleId: script.scheduleId || '',
      scheduleName: script.scheduleName || '',
      scheduleOutputFileName: script.scheduleOutputFileName || '',
      ScheduleOptions: script.ScheduleOptions || [],
      scheduleType: script.scheduleType ||'',
      scheduleRule: script.scheduleRule || '',

      deployId: script.deployId || '',
      deployUrl: script.deployUrl || '',
      deployName: script.deployName || '',
      deployOptions: script.deployOptions || [],

      date: new Date(),
    };

    const result = await scriptsCollection.updateOne(
      { scriptName: scriptName, userId: decodedToken.userId },
      { $set: newScript },
      { upsert: true }        // Create a new document if no match is found
    );

    let info;
    if (result.upsertedCount > 0) {
      info = `${scriptName} added.`
    } else {
      info = `${scriptName} updated.`
    }

    const USER_DIR = `/${user.userId}/scripts`
    await saveFileToContainer(user.containerId, `${USER_DIR}`, scriptName, script.scriptContent)

    return res.status(200).json({ info, script: { ...newScript, scriptContent: script.scriptContent } });

  } catch (error) {
    logger.error(`ERROR IN SAVING SCRIPT: ${error}`)
    return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { saveScript };
