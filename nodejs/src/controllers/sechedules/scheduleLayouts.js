const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const getScheduleLayouts = async (req, res) => {
  let client;

  try {
    const {decodedToken} = req.body;

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'layouts');
    client = dbClient;


    const layouts = await collection.find({ userId: decodedToken.userId, type: 'scheduleLayout' })

    res.status(200).json({layouts}); 

  } catch (error) {
    console.error('ERROR IN GET SCHEDULE LAYOUT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};



const saveScheduleLayouts = async (req, res) => {
    let client;
  
    try {
      const { layouts, decodedToken } = req.body;
      const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'layouts');
      client = dbClient;
  
      const newLayouts = {
        type: 'scheduleLayout',
        userId: decodedToken.userId,
        layouts:layouts,
        date: new Date(),
  
      };
  
      await collection.insertOne(newLayouts);
     
      res.status(200).json({message:'saved layout.'}); 
  
    } catch (error) {
      console.error('ERROR IN SAVING SCHEDULE LAYOUT: ', error);
      res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    } finally {
      if (client) {
        await client.close();
      }
    }
  };


module.exports = { 
  getScheduleLayouts,
  saveScheduleLayouts
 };
