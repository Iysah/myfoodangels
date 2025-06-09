import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert, StatusBar } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import SolidButton from '../../../components/button/solidButton'
import { ImageIcon, Trash2, Video } from 'lucide-react-native'
// @ts-ignore
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import { useVideoPlayer, Video as VideoPlayer, VideoView } from 'expo-video';
import { store } from '../../../store/root';
import { observer } from 'mobx-react-lite'
import { useRoute } from '@react-navigation/native'

const RegisterScreen:FC<any> = observer(({ navigation }) => {
  const route = useRoute()
  const { eventId } = route.params as { eventId: string }
  const { userData } = store.auth
  
  const [name, setName] = useState(userData?.fullName)
  const [contact, setContact] = useState('')
  const [position, setPosition] = useState('')
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false)

  const handleVideoUpload = async () => {
    // Your existing code remains the same
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
            }
          }
        },
      ]
    );
  };

  const handleDeleteVideo = () => {
    setVideo(null)
  }
  
  // Create video player instance
  const player = useVideoPlayer(video?.uri || '', (player) => {
    player.loop = true;
    player.muted = false;
    // player.play();
  });
  

  const handleRegister = async () => {
    try {
      if (!name || !contact || !position) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
      }

      setLoading(true)

      const formData = new FormData();
      formData.append('trial', eventId)
      formData.append('name', name);
      formData.append('contactInfo', contact);
      formData.append('position', position);
      
      if (video) {
        // @ts-ignore - React Native FormData type issue
        formData.append('picture', {
            uri: video.uri,
            type: 'video/mp4',
            name: 'video.mp4'
        });
      }

      await store.athlete.applyForTrial(formData);
      Alert.alert('Success', 'Registration submitted successfully');
      setLoading(false)
      navigation.navigate('Activities');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit registration. Please try again.'
      );
    } finally {
      setLoading(false),
      setPosition('')
      setContact('')
      setVideo(null)
    }
  }


  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <StatusBar backgroundColor={'transparent'} barStyle={'dark-content'} />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <SettingsHeader navigation={navigation} title="Register for Event" />

            <View style={GLOBALSTYLES.wrapper}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Contact Info</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address or phone number"
                placeholderTextColor="gray"
                value={contact}
                onChangeText={setContact}
              />

              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your position"
                placeholderTextColor="gray"
                value={position}
                onChangeText={setPosition}
              />

                {video ? (
                  <View style={styles.videoContainer}>
                    <VideoView
                      style={styles.videoPreview}
                      player={player}
                      allowsFullscreen
                      allowsPictureInPicture
                    />
                    <TouchableOpacity 
                      style={styles.changeVideoButton} 
                      onPress={handleDeleteVideo}
                    >
                      <Trash2 size={18} color={theme.colors.text.secondary} />
                      <Text style={styles.changeVideoText}>Remove Video</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.imageSelector} onPress={handleVideoUpload}>
                    <View style={styles.imagePlaceholder}>
                      <Video size={32} color="#666" />
                      <Text style={styles.imagePlaceholderText}>Upload a short video of yourself playing</Text>
                    </View>
                  </TouchableOpacity>
                )}

              <SolidButton title='Submit Registration' onPress={handleRegister} isLoading={loading} />
            </View>
        </ScrollView>
    </SafeAreaProvider>
  )
});

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    label: {
        fontWeight: '500',
        fontSize: typography.fontSize.md,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        color: theme.colors.text.primary,
      },
      input: {
        backgroundColor: '#F2F2F2',
        borderRadius: theme.borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: spacing.sm,
      },
      imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 24,
      },
      imageSelector: {
        height: 200,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#000',
        borderRadius: 8,

        marginBottom: 24,
        marginTop: spacing.md,

        overflow: 'hidden',
        backgroundColor: '#FFF',
      },
      imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      imagePlaceholderText: {
        marginTop: 8,
        color: '#666',
        fontSize: 16,
      },
      videoContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.md,
      },
      videoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#000',
      },
      changeVideoButton: {
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,

        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,

        alignSelf: 'flex-end'
      },
      changeVideoText: {
        color: theme.colors.text.secondary,
        fontWeight: '500',
        fontSize: 14,
      },
})