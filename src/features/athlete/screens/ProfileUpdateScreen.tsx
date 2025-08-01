import { StyleSheet, Text, TouchableOpacity, View, Image, Platform, Alert } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { Camera, Pencil, Plus, Trash2, X } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { observer } from 'mobx-react-lite'
import { spacing } from '../../../config/spacing'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { store } from '../../../store/root'
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../../../../components/ui/toast'

const ProfileUpdateScreen:FC<any> = observer(({ navigation}) => {
    const [image, setImage] = useState<any>(null);
    const { userData } = store.auth;
    const { toast } = useToast();
    
    const handleImageUpload = async () => {
        // Request permissions first
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
            Alert.alert('Permissions required', 'Please grant camera and media library permissions to upload image.');
            return;
          }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (result.assets) {
            const selectedImage = result.assets[0];
            setImage(selectedImage);

            try {
                // Create a form data object with the image file
                const formData = new FormData();
                // @ts-ignore - React Native FormData type definitions are incomplete
                formData.append('picture', {
                    uri: selectedImage.uri,
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'profile.jpg'
                });

                await store.auth.updateProfileImage(formData);
                toast({
                    title: 'Success',
                    description: 'Profile image updated',
                    variant: 'success',
                });
            } catch (error: any) {
                console.error('Failed to upload image: ', error.response.error.message);
                // You might want to show an error message to the user here
            }
        }

        if (result.canceled) {
            Alert.alert('No image selected');
            return;
        }
        
        
    }

    const handleDeleteImage = () => {
        Alert.alert('Delete image', 'Are you sure you want to delete this image?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => {
                setImage(null);
            } }
        ]);
    }
  return (
    <SafeAreaProvider style={{ backgroundColor: '#000', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <View style={GLOBALSTYLES.wrapper}>
            <View style={GLOBALSTYLES.row}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={32} color={theme.colors.lightBg} style={styles.backBtn} />
                </TouchableOpacity>
                <Text style={styles.title}>Profile Photo</Text>
            </View>

            <View style={[styles.wrapper]}>
                <View />

                <Image
                    source={
                        image
                        ? { uri: image.uri }
                        : userData?.profileImg
                        ? { uri: userData.profileImg }
                        : require('../../../../assets/profile.png')
                    }
                    style={styles.avatar}
                />

                <View style={styles.btnWrapper}>
                    <TouchableOpacity onPress={() => handleImageUpload()} style={styles.btnRow}>
                        <Pencil size={18} color={theme.colors.lightBg} />
                        <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleImageUpload()} style={styles.btnRow}>
                        <Camera size={18} color={theme.colors.lightBg} />
                        <Text style={styles.btnText}>Add photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDeleteImage()} style={styles.btnRow}>
                        <Trash2 size={18} color={theme.colors.lightBg} />
                        <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </SafeAreaProvider>
  )
})

export default ProfileUpdateScreen

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'column',
        // marginVertical: 20
    },
    backBtn: {
        // marginBottom: spacing.lg
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        // marginBottom: spacing.xl,
        color: '#fff'
    },
    btnWrapper: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    btnRow: {
        backgroundColor: '#2D2D2D',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: theme.borderRadius.rounded,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '400'
    },
    avatar: { 
        width: 200, height: 200, borderRadius: theme.borderRadius.rounded, marginBottom: 8, backgroundColor: '#eee' 
    },
})