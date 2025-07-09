# Cloudinary Setup Guide for Chat File Upload

## Overview
This guide will help you set up Cloudinary for file uploads in your React Native chat application.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary's website](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

After signing in to your Cloudinary dashboard:

1. **Cloud Name**: Found in your dashboard URL or in the "Account Details" section
2. **API Key**: Available in the "Account Details" section
3. **API Secret**: Available in the "Account Details" section
4. **Upload Preset**: You'll need to create this

## Step 3: Create Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `chat_uploads`)
   - **Signing Mode**: Select **Unsigned** (for client-side uploads)
   - **Folder**: Set to `chat` (optional)
   - **Allowed formats**: Select the formats you want to allow
   - **Max file size**: Set to 10MB or your preferred limit
5. Click **Save**

## Step 4: Update Environment Configuration

Update your `src/config/env.ts` file with your Cloudinary credentials:

```typescript
const ENV = {
  dev: {
    // ... other config
    cloudinary: {
      cloudName: 'your-actual-cloud-name',
      uploadPreset: 'your-upload-preset-name',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
    },
  },
  staging: {
    // ... other config
    cloudinary: {
      cloudName: 'your-actual-cloud-name',
      uploadPreset: 'your-upload-preset-name',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
    },
  },
  prod: {
    // ... other config
    cloudinary: {
      cloudName: 'your-actual-cloud-name',
      uploadPreset: 'your-upload-preset-name',
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
    },
  },
};
```

## Step 5: Configure Upload Preset Settings

In your Cloudinary dashboard, configure your upload preset with these recommended settings:

### For Images:
- **Transformation**: `w_1200,h_1200,c_scale`
- **Quality**: `q_80`
- **Format**: `f_auto`

### For Videos:
- **Max duration**: 60 seconds
- **Format**: `f_mp4`
- **Quality**: `q_80`

### For Documents:
- **Allowed formats**: PDF, DOC, DOCX, TXT
- **Max file size**: 10MB

## Step 6: Test the Integration

1. Run your app
2. Navigate to a chat
3. Tap the attachment button (paperclip icon)
4. Select a file type (image, video, or document)
5. Choose a file from your device
6. The file should upload to Cloudinary and appear in the chat

## Step 7: Monitor Uploads

You can monitor your uploads in the Cloudinary dashboard:

1. Go to **Media Library**
2. Look for files in the `chat` folder
3. Check upload statistics in **Analytics**

## Security Best Practices

### 1. Use Environment Variables
Never commit your Cloudinary credentials to version control. Use environment variables:

```bash
# .env file
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Restrict Upload Preset
Configure your upload preset with restrictions:
- Set maximum file size
- Restrict allowed formats
- Set folder structure
- Enable authentication if needed

### 3. Use Signed Uploads (Optional)
For additional security, you can use signed uploads:
1. Set your upload preset to **Signed**
2. Implement server-side signature generation
3. Send the signature with upload requests

## Troubleshooting

### Common Issues:

1. **Upload Failed**
   - Check your cloud name and upload preset
   - Verify file size is within limits
   - Ensure file format is allowed

2. **Permission Denied**
   - Check if your upload preset is set to **Unsigned**
   - Verify API key and secret are correct

3. **File Not Displaying**
   - Check the returned URL format
   - Verify the file was uploaded successfully
   - Check network connectivity

### Debug Steps:

1. Check console logs for error messages
2. Verify Cloudinary credentials in environment config
3. Test upload with a simple image first
4. Check Cloudinary dashboard for uploaded files

## File Type Support

### Images:
- JPEG, PNG, GIF, WebP
- Max size: 10MB
- Auto-optimization enabled

### Videos:
- MP4, MOV, AVI, MKV
- Max duration: 60 seconds
- Max size: 50MB

### Documents:
- PDF, DOC, DOCX, TXT
- Max size: 10MB
- Stored as raw files

## Performance Optimization

1. **Image Optimization**: Images are automatically optimized for web delivery
2. **Lazy Loading**: Implement lazy loading for images in chat
3. **Caching**: Cloudinary provides CDN caching for faster delivery
4. **Progressive Loading**: Use Cloudinary's progressive image loading

## Cost Considerations

- **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **Paid Plans**: Start at $89/month for additional storage and bandwidth
- **Monitor Usage**: Check your usage in the Cloudinary dashboard

## Additional Features

### 1. Image Transformations
You can add transformations to image URLs:
```typescript
// Thumbnail
const thumbnailUrl = cloudinaryService.generateOptimizedUrl(publicId, {
  width: 150,
  height: 150,
  quality: 60
});

// High quality
const highQualityUrl = cloudinaryService.generateOptimizedUrl(publicId, {
  quality: 90
});
```

### 2. Video Thumbnails
Generate video thumbnails:
```typescript
const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/t_thumb/${publicId}.jpg`;
```

### 3. File Deletion
Delete files when needed:
```typescript
await cloudinaryService.deleteFile(publicId, 'image');
```

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Native Integration Guide](https://cloudinary.com/documentation/react_native_image_and_video_upload)
- [Upload API Reference](https://cloudinary.com/documentation/upload_images) 