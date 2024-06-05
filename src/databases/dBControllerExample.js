const { connectToSchemaLessDatabase, connectToSchemaDatabase } = require('./path/to/your/database/connection/module');

async function someControllerFunction(req, res) {
  let client;
  try {
    const { client: dbClient, collection } = await connectToSchemaLessDatabase('yourDatabaseName', 'yourCollectionName');
    client = dbClient;

    // Now you can perform database operations using the client and collection objects
    // For example:
    const result = await collection.find({}).toArray();
    
    // Send response
    res.json(result);
    
  } catch (error) {
    console.error('Error in someControllerFunction: ', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  } finally {
    // Close the connection before returning response or in case of error
    if (client) {
      await client.close();
    }
  }
}

async function anotherControllerFunction(req, res) {
    let connection;
    try {
      connection = await connectToSchemaDatabase(process.env.MONGODB_URI);
  
      // Perform database operations using Mongoose schemas/models
  
      // Send response
      res.json({ message: 'Connected to MongoDB' });

    } catch (error) {
      console.error('ERROR IN ${NAME_OF_THIS_FUNCTION} ', error);
      res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  

module.exports = { someControllerFunction, anotherControllerFunction };
