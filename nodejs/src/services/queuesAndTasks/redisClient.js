const IORedis = require('ioredis');

const redisOptions = {
    port: 6379, 
    host: 'singapore-redis.render.com', 
    username: 'red-cq807v8gph6c73eva79g',
    password: 'zQPCwEqbsnAinoGzYKaipiJepPIajWfB', 
    tls: {}, 
    maxRetriesPerRequest: null
};

const client = new IORedis(redisOptions);

client.on('connect', async () => {
  console.log('Connected to the Redis server');
  try {
    const pong = await client.ping();
    console.log('Ping response:', pong);
  } catch (err) {
    console.error('Ping failed', err);
  }
});

client.on('error', (err) => {
  console.error('Error connecting to Redis', err);
  if (err.code === 'ECONNREFUSED') {
    console.error('Connection refused - check if the Redis server is running and accessible.');
  }
});

client.on('end', () => {
  console.log('Redis client disconnected');
});

client.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

module.exports = client;
