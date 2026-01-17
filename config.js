import dotenv from 'dotenv';

dotenv.config();

const config = {

  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  databaseName: process.env.DATABASE_NAME || 'hrms_lite',
  
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  corsOrigins: process.env.CORS_ORIGINS 
};

export default config;

