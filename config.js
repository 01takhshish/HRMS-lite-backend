import dotenv from 'dotenv';

dotenv.config();

const config = {

  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  databaseName: process.env.DATABASE_NAME || 'hrms_lite',
  
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ],
};

export default config;

