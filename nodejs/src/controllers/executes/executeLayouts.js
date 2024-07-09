const { connectToSchemaLessDatabase } = require('../../databases/mongoDB');

const getExecuteLayouts = async (req, res) => {
  let client;

  try {
    const {decodedToken} = req.body;

    const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executeLayout');
    client = dbClient;


    const layouts = await collection.find({ userId: decodedToken.userId, type: 'executeLayout' })

    res.status(200).json({layouts}); 

  } catch (error) {
    console.error('ERROR IN GET EXECUTION LAYOUT: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};



const saveExecuteLayouts = async (req, res) => {
    let client;
  
    try {
      const { layouts, decodedToken } = req.body;
      const { client: dbClient, collection } = await connectToSchemaLessDatabase('controlia', 'executeLayout');
      client = dbClient;
  
      const newLayouts = {
        type: 'executeLayout',
        userId: decodedToken.userId,
        layouts:layouts,
        date: new Date(),
  
      };
  
      await collection.insertOne(newLayouts);
     
      res.status(200).json({message:'saved layout.'}); 
  
    } catch (error) {
      console.error('ERROR IN SAVING EXECUTION LAYOUT: ', error);
      res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    } finally {
      if (client) {
        await client.close();
      }
    }
  };


module.exports = { 
  getExecuteLayouts,
  saveExecuteLayouts
 };
