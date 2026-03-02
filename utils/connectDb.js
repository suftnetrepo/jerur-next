import mongoose from 'mongoose';

export const mongoConnect = async () => {
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  const connectionUrl = process.env.MONGO_URI || 'mongodb+srv://sr72:Kcmkcm12345!@cluster0.ihqj3.mongodb.net/jerur_next_dev?retryWrites=true&w=majority'

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



