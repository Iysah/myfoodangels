import React, { FC, useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Alert, Modal, TouchableOpacity } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { spacing } from '../../../config/spacing'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { typography } from '../../../config/typography'
import VideoUploadForm from '../components/VideoUploadForm'
import { store } from '../../../store/root'
import { CheckCircle } from 'lucide-react-native'

interface VideoData {
  description: string;
  tags: string;
  visibility: 'Public' | 'Private';
  video: {
    uri: string;
    type?: string;
    name?: string;
  };
}

const VideosScreen: FC<any> = ({ navigation }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedPerformanceId, setUploadedPerformanceId] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const handlePost = useCallback(async (data: VideoData) => {
    try {
      if (!data.video) {
        Alert.alert('Error', 'Please select a video to upload')
        return
      }

      const formData = new FormData()
      formData.append('description', data.description)
      formData.append('tag', data.tags)
      formData.append('visibility', data.visibility)
      
      // @ts-ignore - React Native FormData type issue
      formData.append('media', {
        uri: data.video.uri,
        type: 'video/mp4',
        name: 'video.mp4'
      })

      console.log(formData)
      const response = await store.athlete.uploadVideo(formData)
      
      // Assuming the response.data contains the performance object with _id
      if (response && response.data) {
        setUploadedPerformanceId(response.data._id)
        setShowSuccessModal(true)
      } else {
        // Handle case where upload is successful but no ID is returned
        Alert.alert('Success', 'Video uploaded successfully, but could not retrieve details.')
        // Or handle as appropriate
        // navigation.goBack() 
      }

      

    } catch (error: any) {
      console.log(error)
    }
  }, [navigation])

  const handleViewMedia = useCallback(() => {
    setShowSuccessModal(false)
    if (uploadedPerformanceId) {
      // TODO: Navigate to the actual performance details screen
      // You need to have a screen and route configured for this.
      // Example placeholder navigation:
      // navigation.navigate('PerformanceDetails', { performanceId: uploadedPerformanceId })
      Alert.alert(
        'View Media',
        `Navigate to performance ID: ${uploadedPerformanceId}.\n\nImplement actual navigation here.`
      )
    }
  }, [navigation, uploadedPerformanceId])

  const handlePostAnother = useCallback(() => {
    setShowSuccessModal(false)
    setUploadedPerformanceId(null)
    setFormResetKey(prevKey => prevKey + 1) // Change key to reset form state
  }, [])

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={GLOBALSTYLES.title}>Performance Media</Text>
        </View>

        <VideoUploadForm key={formResetKey} onPost={handlePost} />
        {store.athlete.error && (
          <Text style={styles.error}>{store.athlete.error}</Text>
        )}
      </ScrollView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <CheckCircle size={60} color={theme.colors.primary} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Your performance media has been posted successfully!</Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleViewMedia}>
                <Text style={styles.modalButtonText}>View Media</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.postAnotherButton]} onPress={handlePostAnother}>
                {/* Assuming Plus icon is available */} 
                <Text style={[styles.modalButtonText, styles.postAnotherText]}>+ Post another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  )
}

export default VideosScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: spacing.md,
    borderBottomColor: '#EDEDED',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  postAnotherButton: {
    backgroundColor: theme.colors.primary,
  },
  postAnotherText: {
    color: '#fff',
  },
  error: {
    color: theme.colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
})