import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'https://vercel-push.onrender.com/api/v1',
    socketUrl: 'wss://dev-socket.confluenx.com',
    uploadUrl: 'https://dev-uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_DEV_GOOGLE_MAPS_API_KEY',
  },
  staging: {
    apiUrl: 'https://vercel-push-mauve.vercel.app/api/v1',
    socketUrl: 'wss://staging-socket.confluenx.com',
    uploadUrl: 'https://staging-uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_STAGING_GOOGLE_MAPS_API_KEY',
  },
  prod: {
    apiUrl: 'https://api.confluenx.com',
    socketUrl: 'wss://socket.confluenx.com',
    uploadUrl: 'https://uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_PROD_GOOGLE_MAPS_API_KEY',
  },
};

const getEnvVars = () => {
  const env = Constants.expoConfig?.extra?.env || 'dev';
  return ENV[env as keyof typeof ENV];
};

export default getEnvVars(); 