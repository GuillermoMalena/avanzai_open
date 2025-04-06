// Configure different environments
const LOCAL_API_URL = 'http://localhost:8000';
const DEV_API_URL = 'https://29ab5bd2-c699-4064-be52-ba9cecd261f6-00-3ifqjlec2cfe1.spock.replit.dev'; // Replace with your dev URL
const PROD_API_URL = 'https://allie-backend-hello471.replit.app'; // Replace with your prod URL

// Set which environment to use (local, dev, prod)
const CURRENT_ENV = 'prod'; // Change this to switch environments

// Map environment to URL
const API_URL_MAP = {
  local: LOCAL_API_URL,
  dev: DEV_API_URL, 
  prod: PROD_API_URL
};

export const env = {
  NEXT_PUBLIC_FASTAPI_BASE_URL: process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || API_URL_MAP[CURRENT_ENV],
};