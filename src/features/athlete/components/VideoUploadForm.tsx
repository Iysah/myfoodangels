import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { Video } from 'lucide-react-native';
import SolidButton from '../../../components/button/solidButton';
// @ts-ignore
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import { Video as VideoPlayer } from 'expo-video';
import { theme } from '../../../config/theme';

type Visibility = 'Public' | 'Private';

interface VideoUploadFormProps {
  onPost: (data: { description: string; tags: string; visibility: Visibility; video: any }) => void;
  onPreview?: () => void;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ onPost, onPreview }) => {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isVideoPlayerReady, setIsVideoPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoUpload = async () => {
    // Request permissions first
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert('Permissions required', 'Please grant camera and media library permissions to upload videos.');
      return;
    }

    Alert.alert(
      'Upload Video',
      'Choose how you want to upload your video',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 1,
            });

            if (!result.canceled) {
              setVideo(result.assets[0]);
              setIsVideoPlayerReady(true);
            }
          },
        },
        {
          text: 'Take Video',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 1,
            });

            if (!result.canceled) {
              setVideo(result.assets[0]);
              setIsVideoPlayerReady(true);
            }
          }
        },
      ]
    );
  };

  const handlePost = async () => {
    if (!description) {
      Alert.alert('Error', 'Please select a description to upload');
      return;
    }

    if (!video) {
      Alert.alert('Error', 'Please select a video to upload');
      return;
    }

    try {
      setIsLoading(true);
      await onPost({ description, tags, visibility, video });
    } catch (error) {
      Alert.alert('Error', 'Failed to post media. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textArea, { textAlignVertical: 'top'}]}
        placeholder="Description"
        placeholderTextColor={theme.colors.text.secondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.uploadBox} onPress={handleVideoUpload}>
        {video && isVideoPlayerReady ? (
          // <VideoPlayer
          //   source={{ uri: video.uri }}
          //   useNativeControls
          //   resizeMode="contain"
          //   isLooping
          //   style={styles.videoPreview}
          //   onLoad={() => setIsVideoPlayerReady(true)}
          //   onError={() => {
          //     setIsVideoPlayerReady(false);
          //     Alert.alert('Error', 'Failed to load video preview');
          //   }}
          // />
          <Text>Uploaded</Text>
        ) : (
          <>
            <Video size={36} color="#222" />
            <Text style={styles.uploadText}>Upload a video</Text>
          </>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Tags"
        placeholderTextColor={theme.colors.text.secondary}
        value={tags}
        onChangeText={setTags}
      />

      <View style={styles.visibilitySection}>
        <Text style={styles.visibilityLabel}>Visibility</Text>
        <TouchableOpacity
          style={styles.radioRow}
          onPress={() => setVisibility('Public')}
        >
          <View style={styles.radioOuter}>
            {visibility === 'Public' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioRow}
          onPress={() => setVisibility('Private')}
        >
          <View style={styles.radioOuter}>
            {visibility === 'Private' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioText}>Private</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.previewText}>Preview</Text>

      <SolidButton title='Post Media' onPress={handlePost} isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fafafa',
    flex: 1,
  },
  textArea: {
    backgroundColor: '#ededed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    color: theme.colors.text.primary,

    minHeight: 100,
    padding: 10,
    fontSize: 15,
    marginBottom: 14,

    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#bbb',
    borderRadius: 8,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  uploadText: {
    marginTop: 8,
    color: '#222',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#ededed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D1',

    padding: 10,
    fontSize: 15,
    marginBottom: 18,
  },
  visibilitySection: {
    marginBottom: 18,
  },
  visibilityLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  radioText: {
    fontSize: 15,
    color: '#222',
  },
  previewText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: '#888',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
});

export default VideoUploadForm;
