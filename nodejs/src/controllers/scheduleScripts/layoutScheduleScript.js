require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const getScheduleLayouts = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { decodedToken } = req.body;

    await client.connect();
    const db = client.db("controlia");
    const layoutCollection = db.collection('layouts');

    const layouts =await layoutCollection.find({ userId: decodedToken.userId, type: 'scheduleLayouts' }).toArray();

    return res.status(200).json({ message: `Successfully fetched scheduleLayouts for ${decodedToken.userId}`, layouts });

  } catch (error) {
    console.error('ERROR IN GETTING SCHEDULE LAYOUT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

const saveScheduleLayouts = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { layouts, decodedToken } = req.body;
    if (!layouts) {
      return res.status(422).json({ info: "layouts missing in body." });
    }

    await client.connect();
    const db = client.db("controlia");
    const layoutCollection = db.collection('layouts');

    const newLayouts = {
      type: 'scheduleLayouts',
      userId: decodedToken.userId,
      layouts: layouts,
      date: new Date(),
    };

    await layoutCollection.insertOne(newLayouts);

    return res.status(200).json({ message: 'Successfully saved layouts.' });

  } catch (error) {
    console.error('ERROR IN SAVING SCHEDULE LAYOUT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};



module.exports = { getScheduleLayouts, saveScheduleLayouts };
