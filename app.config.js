import path from "path";
import fs from "fs";

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PRO = process.env.APP_VARIANT === 'production';

const envFile = IS_PRO ? '.env.pro' : '.env.dev'
const envFilePath = path.resolve(__dirname, envFile);

require('dotenv').config({
  path: envFilePath,
});

// Automatically expose all environment variables from .env file
const getAllEnvVars = () => {
  const envVars = {};
  
  // Read the .env file directly to get only variables defined there
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach((line) => {
      // Skip comments and empty lines
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          // Use process.env value (dotenv may have processed it)
          envVars[key] = process.env[key] || value;
        }
      }
    });
  }
  
  return envVars;
};

export default ({ config }) => ({
  ...config,
  name: process.env.APP_NAME,
  ios: {
    ...config.ios,
    bundleIdentifier: process.env.PACKAGE_NAME,
  },
  android: {
    ...config.android,
    package: process.env.PACKAGE_NAME,
  },
  extra: {
    env: getAllEnvVars(),
  },
});