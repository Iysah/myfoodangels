import React, { FC, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Image, Alert, KeyboardAvoidingView, Switch } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { Dropdown } from 'react-native-element-dropdown';
import { Calendar, Clock, ImageIcon, MapPin, Users } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { ageGroups, eventTypes, skillLevels } from '../../../data/eventSetup';
import SolidButton from '../../../components/button/solidButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { useToast } from '../../../../components/ui/toast'


const CreateTrial:FC<any> = observer(({ navigation }) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [organizer, setOrganizer] = useState('Smith XYZ');
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState(null);
  const [location, setLocation] = useState('');
  const [ageGroup, setAgeGroup] = useState('u18');
  const [skillLevel, setSkillLevel] = useState('');
  const [specificRequirement, setSpecificRequirement] = useState('');
  const [trialFees, setTrialFees] = useState('');
  const [free, setFree] = useState(false);
  const [refoundPolicy, setRefoundPolicy] = useState('');
  const [description, setDescription] = useState('');
  const [documentRequirement, setDocumentRequirement] = useState<string[]>([]);
  const [newDocument, setNewDocument] = useState('');
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [image, setImage] = useState<any>(null); // for Expo ImagePicker result
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [maxAttendance, setMaxAttendance] = useState('10');
  const { toast } = useToast();

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const handleDeadlineChange = (event: any, selectedDate?: Date) => {
    setShowDeadlinePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'hh:mm a');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleCreateEvent = async () => {
    // Validate all required fields
    if (
      !title || !eventType || !organizer || !startDate || !startTime || !endDate || !endTime ||
      !deadline || !location || !ageGroup || !skillLevel || !trialFees || !refoundPolicy ||
      !specificRequirement || !description || !image
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select an image',
        variant: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Combine date and time for start and end
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

      const formData = new FormData();
      formData.append('name', title);
      formData.append('trialType', eventType);
      formData.append('organizerName', organizer);
      formData.append('trialDate', startDateTime.toISOString());
      formData.append('registrationDeadline', deadline.toISOString());
      formData.append('location', location);
      formData.append('eligibility', ageGroup);
      formData.append('skillLevel', skillLevel);
      formData.append('specificRequirement', specificRequirement);
      formData.append('trialFees', trialFees);
      formData.append('free', free ? 'true' : 'false');
      formData.append('refoundPolicy', refoundPolicy);
      formData.append('description', description);
      formData.append('maximumAttendance', maxAttendance);

      // Arrays
      documentRequirement.forEach((doc, idx) => {
        formData.append(`documentRequirement[${idx}]`, doc);
      });
      equipmentNeeded.forEach((eq, idx) => {
        formData.append(`equipmentNeeded[${idx}]`, eq);
      });

      // Image
      const getMimeType = (uri: string) => {
        const extension = uri.split('.').pop();
        if (extension === 'png') return 'image/png';
        return 'image/jpeg';
      };

      formData.append('picture', {
        uri: image.uri,
        name: image.fileName || `event.${image.uri.split('.').pop() || 'jpg'}`,
        type: getMimeType(image.uri),
      });

      // API call
      const response = await apiClient.post('/scout/create-trial', formData);

      toast({
        title: 'Success',
        description: 'Event created successfully',
        variant: 'success',
      });
      console.log('response', response);
      navigation.navigate('EventCreationScreen');
    } catch (error: any) {
      if (error.response) {
        console.log('Error response:', error.response);
        toast({
          title: 'Error',
          description: error.response.data?.message || 'Failed to create event',
          variant: 'error',
        });
      } else if (error.request) {
        console.log('Error request:', error.request);
        toast({
          title: 'Error',
          description: 'No response from server',
          variant: 'error',
        });
      } else {
        console.log('Error message:', error.message);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create event',
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.wrapper}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={GLOBALSTYLES.wrapper}>
            <Text style={GLOBALSTYLES.title}>Create Event</Text>

            {/* Event Details */}
            <Text style={styles.sectionTitle}>Event Details</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={'gray'}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Event Type</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={eventTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select type"
              value={eventType}
              onChange={(item) => {setEventType(item.value)}}
            />

            <Text style={styles.label}>Organizer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter organizer name"
              placeholderTextColor={theme.colors.text.secondary}
              value={organizer}
              onChangeText={setOrganizer}
            />

            <View style={styles.divider} />

            {/* Date & Time */}
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <Text style={styles.label}>Start Date & Time</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
                <Calendar size={18} color="#888" />
                <Text style={styles.dateText}>{formatDate(startDate) || 'Date'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartTimePicker(true)}>
                <Clock size={18} color="#888" />
                <Text style={styles.dateText}>{formatTime(startTime) || 'Time'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>End Date & Time</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
                <Calendar size={18} color="#888" />
                <Text style={styles.dateText}>{formatDate(endDate) || 'Date'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndTimePicker(true)}>
                <Clock size={18} color="#888" />
                <Text style={styles.dateText}>{formatTime(endTime) || 'Time'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Registration Deadline</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDeadlinePicker(true)}>
              <Calendar size={18} color="#888" />
              <Text style={styles.dateText}>{formatDate(deadline) || 'Date'}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Location */}
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.label}>Venue Name/Address</Text>
            <View style={[styles.inputWithIcon, { borderRadius: 8, borderWidth: 1, borderColor: '#D1D1D1', minHeight: 40, paddingHorizontal: 12, }]}>
              <MapPin size={18} color="#888" />
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, backgroundColor: 'transparent', color: '#000000', fontSize: 16, }]}
                placeholder="Enter venue name/address"
                placeholderTextColor="#888888" // Hardcode for testing
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.divider} />

            {/* Eligibility */}
            <Text style={styles.sectionTitle}>Eligibility</Text>
            <Text style={styles.label}>Age group</Text>
            <Dropdown 
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              maxHeight={300}
              valueField="value"
              labelField='label'
              placeholder='Under - 18'
              data={ageGroups}
              value={ageGroup}
              onChange={(item) => {setAgeGroup(item.value)}}
            />

            {/* Skill Level */}
            <Text style={styles.label}>Skill Level</Text>
            <Dropdown 
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              maxHeight={300}
              valueField="value"
              labelField='label'
              placeholder='Beginner'
              data={skillLevels}
              value={skillLevel}
              onChange={(item) => {setSkillLevel(item.value)}}
            />


            {/* Specific Requirement */}
            <Text style={styles.label}>Specific Requirement</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter specific requirement"
              value={specificRequirement}
              onChangeText={setSpecificRequirement}
            />

            <View style={styles.divider} />

            {/* Trial Fees */}
            <Text style={styles.sectionTitle}>Trial Fees</Text>

            {/* Free */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.label}>Free Event?</Text>
              <Switch value={free} onValueChange={setFree} trackColor={{ true: '#E9E9F9', false: theme.colors.text.secondary }} thumbColor={theme.colors.primary} />
            </View>

            <Text style={styles.label}>Fee (NGN)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter trial fees"
              placeholderTextColor={'gray'}
              value={trialFees}
              onChangeText={setTrialFees}
              keyboardType="numeric"
            />            

            {/* Refund Policy */}
            <Text style={styles.label}>Refund Policy</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter refund policy"
              value={refoundPolicy}
              onChangeText={setRefoundPolicy}
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Requirements</Text>

            {/* Document Requirements */}
            <Text style={styles.label}>Document Requirements</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add document"
                value={newDocument}
                onChangeText={setNewDocument}
              />
              <TouchableOpacity
                style={{ marginLeft: 8, backgroundColor: '#00008B', padding: 8, borderRadius: 6 }}
                onPress={() => {
                  if (newDocument.trim()) {
                    setDocumentRequirement([...documentRequirement, newDocument.trim()]);
                    setNewDocument('');
                  }
                }}
              >
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
            {documentRequirement.map((doc, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ flex: 1 }}>{doc}</Text>
                <TouchableOpacity onPress={() => setDocumentRequirement(documentRequirement.filter((_, i) => i !== idx))}>
                  <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Equipment Needed */}
            <Text style={styles.label}>Equipment Needed</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add equipment"
                value={newEquipment}
                onChangeText={setNewEquipment}
              />
              <TouchableOpacity
                style={{ marginLeft: 8, backgroundColor: '#00008B', padding: 8, borderRadius: 6 }}
                onPress={() => {
                  if (newEquipment.trim()) {
                    setEquipmentNeeded([...equipmentNeeded, newEquipment.trim()]);
                    setNewEquipment('');
                  }
                }}
              >
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
            {equipmentNeeded.map((eq, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ flex: 1 }}>{eq}</Text>
                <TouchableOpacity onPress={() => setEquipmentNeeded(equipmentNeeded.filter((_, i) => i !== idx))}>
                  <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, backgroundColor: '#F2F2F2' }]}
              placeholder="Descrie the event, requirements, and what athletes can expect"
              placeholderTextColor={'gray'}
              value={description}
              onChangeText={setDescription}
              multiline
            />
            {/* Choose Movie Section */}
            <Text style={styles.label}>Upload Images or Videos (Optional)</Text>
            {image ? (
              <Image 
                source={{ uri: image.uri }} 
                style={styles.imagePreview} 
              />
            ) : (
              <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                <View style={styles.imagePlaceholder}>
                    <ImageIcon size={24} color="#666" />
                    <Text style={styles.imagePlaceholderText}>Choose from Gallery</Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>Maximum Attendance (Optional)</Text>
            <View style={[styles.inputWithIcon, { borderRadius: 8, borderWidth: 1, borderColor: '#D1D1D1', minHeight: 40, paddingHorizontal: 12, }]}>
              <Users size={18} color="#888" />
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, color: theme.colors.text.primary }]}
                placeholder="Enter maximum number of attendees"
                placeholderTextColor="#888888"
                value={maxAttendance}
                onChangeText={setMaxAttendance}
              />
            </View>

            <SolidButton title={loading ? 'Creating...' : 'Create Event'} onPress={handleCreateEvent} isLoading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          onChange={handleStartDateChange}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          onChange={handleStartTimeChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          onChange={handleEndDateChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          onChange={handleEndTimeChange}
        />
      )}

      {showDeadlinePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          onChange={handleDeadlineChange}
        />
      )}
    </SafeAreaProvider>
  )
})

export default CreateTrial

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: theme.colors.text.secondary,
  },
  label: {
    fontWeight: '500',
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.text.primary,
  },
  input: {
    // backgroundColor: '#F2F2F2',  
    borderRadius: theme.borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // color: theme.colors.text.primary,
    marginBottom: spacing.sm,
  },
  dropdown: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
    backgroundColor: '#F2F2F2',
    borderRadius: theme.borderRadius.lg, 
    paddingHorizontal: 10,
    marginBottom: spacing.sm,
  },
  placeholderStyle: { 
      fontSize: 13, color: '#747373' 
  },
  selectedTextStyle: { fontSize: 14, color: '#747373' },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: spacing.md,
    marginRight: 5,
  },
  dateText: {
    marginLeft: 8,
    color: '#888',
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',

    backgroundColor: '#F2F2F2',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',

    padding: spacing.md,
    marginBottom: spacing.sm,
    height: 50
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 24,
  },
  imageSelector: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: '#F2F2F2',
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
  wrapper: {
    flex: 1,
    // paddingHorizontal: 9,
  },
  scrollContent: {
    paddingBottom: 100, // Add extra padding at the bottom
  },
})