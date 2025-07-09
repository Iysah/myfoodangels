import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
}

export interface PickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsMultipleSelection?: boolean;
}

class FilePickerService {
  /**
   * Request permissions for camera and photo library
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and photo library permissions are required to upload files.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Pick an image from camera or photo library
   */
  async pickImage(source: 'camera' | 'library', options: PickerOptions = {}): Promise<FileInfo | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection || false,
      };

      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: this.generateFileName(asset.uri, 'image'),
          size: asset.fileSize || 0,
          type: 'image',
          mimeType: this.getMimeTypeFromUri(asset.uri),
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  /**
   * Pick a video from camera or photo library
   */
  async pickVideo(source: 'camera' | 'library', options: PickerOptions = {}): Promise<FileInfo | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality || 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection || false,
        videoMaxDuration: 60, // 60 seconds max
      };

      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: this.generateFileName(asset.uri, 'video'),
          size: asset.fileSize || 0,
          type: 'video',
          mimeType: this.getMimeTypeFromUri(asset.uri),
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
      return null;
    }
  }

  /**
   * Pick a document from device storage
   */
  async pickDocument(): Promise<FileInfo | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.name || this.generateFileName(asset.uri, 'document'),
          size: asset.size || 0,
          type: 'document',
          mimeType: asset.mimeType || 'application/octet-stream',
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      return null;
    }
  }

  /**
   * Show file picker options
   */
  async showFilePickerOptions(): Promise<FileInfo | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Choose File Type',
        'Select the type of file you want to upload',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.pickImage('camera');
              resolve(result);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await this.pickImage('library');
              resolve(result);
            },
          },
          {
            text: 'Video',
            onPress: async () => {
              const result = await this.pickVideo('library');
              resolve(result);
            },
          },
          {
            text: 'Document',
            onPress: async () => {
              const result = await this.pickDocument();
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  }

  /**
   * Generate a file name from URI
   */
  private generateFileName(uri: string, type: string): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(uri);
    return `${type}_${timestamp}.${extension}`;
  }

  /**
   * Get file extension from URI
   */
  private getFileExtension(uri: string): string {
    const parts = uri.split('.');
    return parts[parts.length - 1] || 'jpg';
  }

  /**
   * Get MIME type from URI
   */
  private getMimeTypeFromUri(uri: string): string {
    const extension = this.getFileExtension(uri).toLowerCase();
    
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
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
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

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  }
}

export const filePickerService = new FilePickerService(); 