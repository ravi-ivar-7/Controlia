require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const getExecuteLayouts = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    const { decodedToken } = req.body;

    await client.connect();
    const db = client.db("controlia");
    const layoutCollection = db.collection('layouts');

    const layouts =await layoutCollection.find({ userId: decodedToken.userId, type: 'executeLayouts' }).toArray();

    return res.status(200).json({ message: `Successfully fetched executeLayouts for ${decodedToken.userId}`, layouts });

  } catch (error) {
    console.error('ERROR IN GETTING EXECUTE LAYOUT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

const saveExecuteLayouts = async (req, res) => {
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
      type: 'executeLayouts',
      userId: decodedToken.userId,
      layouts: layouts,
      date: new Date(),
    };

    await layoutCollection.insertOne(newLayouts);

    return res.status(200).json({ message: 'Successfully saved layouts.' });

  } catch (error) {
    console.error('ERROR IN SAVING EXECUTE LAYOUT: ', error);
    return res.status(500).json({ info: 'INTERNAL SERVER ERROR', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
};



module.exports = { getExecuteLayouts, saveExecuteLayouts };
