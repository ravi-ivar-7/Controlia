require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const logger = require('../../services/logs/winstonLogger')

const resetNotebookSchedule = async (user, notebook) => {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
      

        await client.connect();
        const db = client.db("controlia");
        const notebooksCollection = db.collection('notebooks')

        
        const notebookUpdateFields = {
            scheduleName: '',
            scheduleOutputFileName:'',
            scheduleOptions: [],
            scheduleType: '',
            scheduleRule:'',
            date: new Date(),
        };
        
        await notebooksCollection.findOneAndUpdate(
            { userId: user.userId, notebookId: notebook.notebookId },
            { $set: notebookUpdateFields },
            { returnDocument: 'after', upsert: true }
        );

        return `Successfully deleted/updated notebook schedule.`

    } catch (error) {
        logger.error(`ERROR IN DELETING/UPDATING NOTEBOOK SCHEDULE: ${error}`);
        throw error;
    }
};

module.exports = {
    resetNotebookSchedule
};
