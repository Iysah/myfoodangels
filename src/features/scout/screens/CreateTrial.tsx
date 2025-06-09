import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Image, Alert, KeyboardAvoidingView } from 'react-native'
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
import { typography } from '../../../config/typography';


const CreateTrial = () => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [organizer, setOrganizer] = useState('Smith XYZ');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [ageGroup, setAgeGroup] = useState('u18');
  const [skillLevel, setSkillLevel] = useState('');
  const [image, setImage] = useState('')
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [maxAttendance, setMaxAttendance] = useState('10');

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

  const handleCreateEvent = () => {
    if (!title || !eventType || !organizer || !startDate || !startTime || !endDate || !endTime || !deadline || !location || !ageGroup || !skillLevel || !maxAttendance) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Combine date and time for start and end
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

    // Create event object
    const eventData = {
      title,
      eventType,
      organizer,
      startDateTime,
      endDateTime,
      deadline,
      location,
      ageGroup,
      skillLevel,
      maxAttendance,
    };

    // TODO: Handle event creation
    console.log('Event Data:', eventData);
  }

  const pickImage = () => {

  }

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
            <Text style={GLOBALSTYLES.title}>Create Trial & Event</Text>

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
                placeholder="Enter event location"
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
              placeholder='Under - 18'
              data={skillLevels}
              value={skillLevel}
              onChange={(item) => {setSkillLevel(item.value)}}
            />

            <View style={styles.divider} />

            {/* Choose Movie Section */}
            <Text style={styles.label}>Upload Images or Videos (Optional)</Text>
            {image ? (
              <Image 
                source={{ uri: image }} 
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
                style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, backgroundColor: 'transparent', color: theme.colors.text.primary }]}
                placeholder="Enter maximum number of attendees"
                placeholderTextColor="#888888"
                value={maxAttendance}
                onChangeText={setMaxAttendance}
              />
            </View>

            <SolidButton title='Create Event' onPress={handleCreateEvent} />
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
}

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