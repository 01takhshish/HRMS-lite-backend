import mongoose from 'mongoose';
import config from './config.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(config.mongodbUrl, {
      dbName: config.databaseName,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
   
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

export default mongoose;

