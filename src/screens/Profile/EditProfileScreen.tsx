import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../contexts/StoreContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../styles/globalStyles';

const EditProfileScreen = observer(() => {
  const { authStore } = useStores();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    phone: '',
    photoURL: '',
    addressDetails: {
      address: '',
      city: '',
      company: '',
      country: 'NG',
      state: '',
      zipcode: '',
    },
  });

  useEffect(() => {
    if (authStore.user) {
      setFormData({
        displayName: authStore.user.displayName || '',
        email: authStore.user.email || '',
        firstName: authStore.user.firstName || '',
        lastName: authStore.user.lastName || '',
        phoneNumber: authStore.user.phoneNumber || '',
        phone: authStore.user.phone || '',
        photoURL: authStore.user.photoURL || '',
        addressDetails: {
          address: authStore.user.addressDetails?.address || '',
          city: authStore.user.addressDetails?.city || '',
          company: authStore.user.addressDetails?.company || '',
          country: authStore.user.addressDetails?.country || 'NG',
          state: authStore.user.addressDetails?.state || '',
          zipcode: authStore.user.addressDetails?.zipcode || '',
        },
      });
    }
  }, [authStore.user]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('addressDetails.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        addressDetails: {
          ...prev.addressDetails,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          photoURL: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!authStore.user) {
      Alert.alert('Error', 'No user found. Please log in again.');
      return;
    }

    if (!formData.displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required.');
      return;
    }

    if (!formData.firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required.');
      return;
    }

    if (!formData.lastName.trim()) {
      Alert.alert('Validation Error', 'Last name is required.');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }

    if (!formData.addressDetails.address.trim()) {
      Alert.alert('Validation Error', 'Street address is required.');
      return;
    }

    if (!formData.addressDetails.city.trim()) {
      Alert.alert('Validation Error', 'City is required.');
      return;
    }

    if (!formData.addressDetails.state.trim()) {
      Alert.alert('Validation Error', 'State is required.');
      return;
    }

    setIsLoading(true);

    try {
      // Update user profile using the comprehensive method
      await authStore.updateUserProfile({
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoURL: formData.photoURL,
        addressDetails: formData.addressDetails,
      });
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back or refresh user data
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileImage = () => {
    return (
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
          {formData.photoURL ? (
            <Image source={{ uri: formData.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Tap to change photo</Text>
      </View>
    );
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    editable: boolean = true
  ) => {
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.textInput, !editable && styles.disabledInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  };

  if (!authStore.user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No user data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>

        {renderProfileImage()}

        <View style={styles.form}>
          {renderFormField(
            'Display Name',
            formData.displayName,
            (text) => handleInputChange('displayName', text),
            'Enter your display name'
          )}

          {renderFormField(
            'First Name',
            formData.firstName,
            (text) => handleInputChange('firstName', text),
            'Enter your first name'
          )}

          {renderFormField(
            'Last Name',
            formData.lastName,
            (text) => handleInputChange('lastName', text),
            'Enter your last name'
          )}

          {renderFormField(
            'Email Address',
            formData.email,
            (text) => handleInputChange('email', text),
            'Enter your email address',
            'email-address'
          )}

          {renderFormField(
            'Phone Number',
            formData.phone,
            (text) => handleInputChange('phone', text),
            'Enter your phone number',
            'phone-pad'
          )}

          <Text style={styles.sectionTitle}>Address Information</Text>

          {renderFormField(
            'Street Address',
            formData.addressDetails.address,
            (text) => handleInputChange('addressDetails.address', text),
            'Enter your street address'
          )}

          {renderFormField(
            'City',
            formData.addressDetails.city,
            (text) => handleInputChange('addressDetails.city', text),
            'Enter your city'
          )}

          {renderFormField(
            'State',
            formData.addressDetails.state,
            (text) => handleInputChange('addressDetails.state', text),
            'Enter your state'
          )}

          {renderFormField(
            'Country',
            formData.addressDetails.country,
            (text) => handleInputChange('addressDetails.country', text),
            'Enter your country'
          )}

          {renderFormField(
            'Company (Optional)',
            formData.addressDetails.company,
            (text) => handleInputChange('addressDetails.company', text),
            'Enter your company name'
          )}

          {renderFormField(
            'Zip Code (Optional)',
            formData.addressDetails.zipcode,
            (text) => handleInputChange('addressDetails.zipcode', text),
            'Enter your zip code'
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});