import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'https://vercel-push-1.onrender.com/api/v1',
    socketUrl: 'https://vercel-push-1.onrender.com',
    uploadUrl: 'https://dev-uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_DEV_GOOGLE_MAPS_API_KEY',
    cloudinary: {
      cloudName: 'dvjmfasif',
      uploadPreset: 'sample-preset',
      apiKey: '745932219132568',
      apiSecret: 'NyckzpTlop_XJqV-x3--jngRM_0',
    },
  },
  staging: {
    apiUrl: 'https://vercel-push-mauve.vercel.app/api/v1',
    socketUrl: 'wss://staging-socket.confluenx.com',
    uploadUrl: 'https://staging-uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_STAGING_GOOGLE_MAPS_API_KEY',
    cloudinary: {
      cloudName: 'your-cloud-name',
      uploadPreset: 'your-upload-preset',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
    },
  },
  prod: {
    apiUrl: 'https://api.confluenx.com',
    socketUrl: 'wss://socket.confluenx.com',
    uploadUrl: 'https://uploads.confluenx.com',
    googleMapsApiKey: 'YOUR_PROD_GOOGLE_MAPS_API_KEY',
    cloudinary: {
      cloudName: 'your-cloud-name',
      uploadPreset: 'your-upload-preset',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
    },
  },
};

const getEnvVars = () => {
  const env = Constants.expoConfig?.extra?.env || 'dev';
  return ENV[env as keyof typeof ENV];
};

export default getEnvVars(); 