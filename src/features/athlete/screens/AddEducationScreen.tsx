import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import { Calendar, X } from 'lucide-react-native'
import PageWrapper from '../../../components/wrapper'
import CustomInput from '../../../components/CustomInput'
import { Dropdown } from 'react-native-element-dropdown'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import SolidButton from '../../../components/button/solidButton'
import { theme } from '../../../config/theme'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'
import { useToast } from '../../../../components/ui/toast'

const AddEducationScreen:FC<any> = observer(({ navigation }) => {
  const [school, setSchool] = useState('')
  const [degree, setDegree] = useState('')
  const [field, setField] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [formattedStartDate, setFormattedStartDate] = useState('DD MM YYYY');
  const [formattedEndDate, setFormattedEndDate] = useState('DD MM YYYY');
  const [isDateObject, setIsDateObject] = useState(false);
  const { toast } = useToast();
  const handleConfirmStartDate = (date: Date): void => {
    // Store the actual Date object
    setStartDate(date);
    setIsDateObject(true);
    
    // Format the date for display only
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
    };
    
    const formattedDateString: string = new Intl.DateTimeFormat('en-US', options).format(date);
    
    // Update state with the formatted date string for display
    setFormattedStartDate(formattedDateString);
    
    // Close the date picker modal
    setStartDatePickerVisible(false);
  };

  const handleConfirmEndDate = (date: Date): void => {
    // Store the actual Date object
    setEndDate(date);
    setIsDateObject(true);
    
    // Format the date for display only
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
    };
    
    const formattedDateString: string = new Intl.DateTimeFormat('en-US', options).format(date);
    
    // Update state with the formatted date string for display
    setFormattedEndDate(formattedDateString);
    
    // Close the date picker modal
    setEndDatePickerVisible(false);
  };

  const handleUpdate = async () => {
    try {
      // console.log(title, date, sport, description)
      setLoading(true)
      // Convert Date object to ISO string
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      await store.auth.addEducation({ school,
        degree,
        field,
        startDate: startDateString,
        endDate: endDateString,
        description, })

      setLoading(false);
      toast({
        title: 'Success',
        description: 'Education added successfully',
        variant: 'success',
      });
      navigation.goBack();
    } catch (error) {
        console.error('Update about failed:', error);
        Alert.alert('Error', 'Failed to add achievement. Please try again.');
    } finally {
        setField('')
        setStartDate(new Date())
        setDescription('')
    }
  }

  return (
    <PageWrapper>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Education</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

          <CustomInput
              label="School"
              placeholder=""
              value={school}
              onChangeText={setSchool}
              keyboardType="default"
              autoCapitalize="none"
          />

          <CustomInput
            label='Degree'
            placeholder=''
            value={degree}
            onChangeText={setDegree}
            keyboardType="default"
            autoCapitalize="none"
          />

          <CustomInput
            label='Field of study'
            placeholder=''
            value={field}
            onChangeText={setField}
            keyboardType="default"
            autoCapitalize="none"
          />

          {/* Start Date */}
          <View>
              <Text style={[GLOBALSTYLES.text, { marginBottom: 8 }]}>Start Date</Text>
              <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setStartDatePickerVisible(true)}
              >
                  <Text style={styles.datePickerButtonText}>{formattedStartDate}</Text>
                  <Calendar size={20} color="#666" />
              </TouchableOpacity>

              <DateTimePickerModal
                  isVisible={isStartDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirmStartDate}
                  onCancel={() => setStartDatePickerVisible(false)}
              />
          </View>

          {/* End Date */}
          <View>
              <Text style={[GLOBALSTYLES.text, { marginBottom: 8 }]}>End Date</Text>
              <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setEndDatePickerVisible(true)}
              >
                  <Text style={styles.datePickerButtonText}>{formattedEndDate}</Text>
                  <Calendar size={20} color="#666" />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmEndDate}
                onCancel={() => setEndDatePickerVisible(false)}
              />
          </View>


            <Text style={styles.labelText}>Description</Text>
            <TextInput
              style={[styles.textArea, { textAlignVertical: 'top'}]}
              placeholder=""
              value={description}
              onChangeText={setDescription}
              multiline
            />
          <SolidButton title={loading ? 'Saving....' : 'Save'} onPress={handleUpdate} />

        </ScrollView>
    </PageWrapper>
  )
});

export default AddEducationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: spacing.xxl
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
},
backBtn: {
    marginBottom: spacing.lg
},
title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xl,
},
labelText: {
    fontSize: typography.fontSize.md,
    marginBottom: theme.spacing.sm,
},
textArea: {
    backgroundColor: theme.colors.lightBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D1',

    minHeight: 100,
    padding: 10,
    fontSize: 15,
    marginBottom: 14,

    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.lightBg,
  },
  datePickerButtonText: {
      fontSize: typography.fontSize.md,
      color: '#333',
  },
})