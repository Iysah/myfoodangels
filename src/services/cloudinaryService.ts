import { Platform } from 'react-native';
import env from '../config/env';

interface UploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface UploadOptions {
  fileType: 'image' | 'video' | 'document';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;

  constructor() {
    this.cloudName = env.cloudinary.cloudName;
    this.uploadPreset = env.cloudinary.uploadPreset;
    this.apiKey = env.cloudinary.apiKey;
  }

  /**
   * Upload a file to Cloudinary
   * @param fileUri - Local file URI
   * @param options - Upload options
   * @returns Promise with upload response
   */
  async uploadFile(fileUri: string, options: UploadOptions): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // Determine the file type and add appropriate headers
      const fileExtension = fileUri.split('.').pop()?.toLowerCase();
      const mimeType = this.getMimeType(fileExtension, options.fileType);
      
      // Create file object for FormData
      const file = {
        uri: fileUri,
        type: mimeType,
        name: `file.${fileExtension}`,
      } as any;

      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('cloud_name', this.cloudName);

      // Add transformation parameters based on file type
      if (options.fileType === 'image') {
        if (options.quality) {
          formData.append('quality', options.quality.toString());
        }
        if (options.maxWidth || options.maxHeight) {
          let transformation = '';
          if (options.maxWidth) transformation += `w_${options.maxWidth},`;
          if (options.maxHeight) transformation += `h_${options.maxHeight},`;
          transformation += 'c_scale';
          formData.append('transformation', transformation);
        }
      }

      // Add folder structure for organization
      formData.append('folder', `chat/${options.fileType}s`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${options.fileType === 'document' ? 'raw' : options.fileType}/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }

  /**
   * Get MIME type based on file extension and type
   */
  private getMimeType(extension?: string, fileType?: string): string {
    if (fileType === 'image') {
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        default:
          return 'image/jpeg';
      }
    } else if (fileType === 'video') {
      switch (extension) {
        case 'mp4':
          return 'video/mp4';
        case 'mov':
          return 'video/quicktime';
        case 'avi':
          return 'video/x-msvideo';
        case 'mkv':
          return 'video/x-matroska';
        default:
          return 'video/mp4';
      }
    } else if (fileType === 'document') {
      switch (extension) {
        case 'pdf':
          return 'application/pdf';
        case 'doc':
          return 'application/msword';
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'txt':
          return 'text/plain';
        default:
          return 'application/octet-stream';
      }
    }
    
    return 'application/octet-stream';
  }

  /**
   * Generate optimized URL for different use cases
   */
  generateOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    let url = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    
    const transformations = [];
    
    if (options.width || options.height) {
      let transform = '';
      if (options.width) transform += `w_${options.width},`;
      if (options.height) transform += `h_${options.height},`;
      transform += 'c_scale';
      transformations.push(transform);
    }
    
    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }
    
    if (options.format) {
      transformations.push(`f_${options.format}`);
    }
    
    if (transformations.length > 0) {
      url += `/${transformations.join('/')}`;
    }
    
    url += `/${publicId}`;
    return url;
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = this.generateSignature(publicId, timestamp);
      
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete file from Cloudinary');
    }
  }

  /**
   * Generate signature for authenticated requests
   */
  private generateSignature(publicId: string, timestamp: number): string {
    // This would require your API secret - implement based on your security requirements
    // For now, we'll use unsigned uploads with upload presets
    return '';
  }
}

export const cloudinaryService = new CloudinaryService(); 