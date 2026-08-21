import mongoose from 'mongoose';

export const mongoConnect = async () => {
  const connectionUrl = process.env.NEXT_PUBLIC_MONGODB_URL

  if (!connectionUrl) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    return;
  }

  const options = {  
    serverSelectionTimeoutMS: 30000, 
    socketTimeoutMS: 30000 
  };

  try {
    await mongoose.connect(connectionUrl, options);
    mongoose.set('strictQuery', false); 
    console.log('Database connected successfully');
  } catch (err) {
    console.error(`Error connecting to the database: ${err.message}`);   
  }
};



