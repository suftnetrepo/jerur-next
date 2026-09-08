import mongoose from 'mongoose';

const globalMongo = globalThis;
const mongoCache = globalMongo.__jerurMongoose || {
  connection: null,
  promise: null
};

globalMongo.__jerurMongoose = mongoCache;

export const mongoConnect = async () => {
  const connectionUrl = process.env.NEXT_PUBLIC_MONGODB_URL;

  if (!connectionUrl) {
    throw new Error('NEXT_PUBLIC_MONGODB_URL is not defined in environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    mongoCache.connection = mongoose;
    return mongoCache.connection;
  }

  // A resolved promise/connection can become stale after MongoDB or the
  // hosting platform closes a socket. Clear it before reconnecting.
  if (mongoose.connection.readyState === 0) {
    mongoCache.connection = null;
    mongoCache.promise = null;
  }

  if (mongoCache.connection) return mongoCache.connection;

  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    // Keep the Render instance's connection footprint bounded. Mongoose's
    // driver default is higher than this application needs per process.
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: 0
  };

  mongoose.set('strictQuery', false);

  if (!mongoCache.promise) {
    mongoCache.promise = mongoose.connect(connectionUrl, options)
      .then((connection) => {
        mongoCache.connection = connection;
        console.log('Database connected successfully');
        return connection;
      })
      .catch((error) => {
        mongoCache.promise = null;
        mongoCache.connection = null;
        throw error;
      });
  }

  return mongoCache.promise;
};
