import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft, Award, Calendar, Plus, X } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { spacing } from '../../../config/spacing'
import { store } from '../../../store/root'
import { Dropdown } from 'react-native-element-dropdown';
import CustomInput from '../../../components/CustomInput'
import SolidButton from '../../../components/button/solidButton'
import { typography } from '../../../config/typography'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { sportsData } from '../../../data/sports'
import { observer } from 'mobx-react-lite'

const AddAchievementScreen:FC<any> = observer(({ navigation }) => {
    const { userData } = store.auth;

    const [title, setTitle] = useState('')
    const [date, setDate] = useState(new Date())
    const [description, setDescription] = useState('')
    const [sport, setSport] = useState('')
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [formattedDate, setFormattedDate] = useState('25th of Jun, 2025');
    const [isDateObject, setIsDateObject] = useState(false);
    const [loading, setLoading] = useState(false)

    const handleConfirmDate = (date: Date): void => {
        // Store the actual Date object
        setDate(date);
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
        setFormattedDate(formattedDateString);
        
        // Close the date picker modal
        setDatePickerVisible(false);
    };

    const handleUpdate = async () => {
        try {
            console.log(title, date, sport, description)
            setLoading(true)
            // Convert Date object to ISO string
            const dateString = date.toISOString().split('T')[0];
            await store.auth.addAchievements({ title, sport, date: dateString, description })
            setLoading(false);
            navigation.goBack();
        } catch (error) {
            console.error('Update about failed:', error);
            Alert.alert('Error', 'Failed to add achievement. Please try again.');
        } finally {
            setTitle('')
            setDate(new Date())
            setDescription('')
            setSport('')
        }
    }
    
  return (
    <PageWrapper>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Achievement</Text>
        <ScrollView showsVerticalScrollIndicator={false}>

            <CustomInput
                label="Title"
                placeholder=""
                value={title}
                onChangeText={setTitle}
                keyboardType="default"
                autoCapitalize="none"
            />

            <Text style={styles.labelText}>Sport</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={sportsData}
              search
              maxHeight={400}
              labelField="label"
              valueField="value"
              placeholder="Select sport"
              value={sport}
              onChange={(item) => {setSport(item.value)}}
            />

            <View>
                <Text style={[GLOBALSTYLES.text, { marginBottom: 8 }]}>Date</Text>
                <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setDatePickerVisible(true)}
                >
                    <Text style={styles.datePickerButtonText}>{formattedDate}</Text>
                    <Calendar size={20} color="#666" />
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={() => setDatePickerVisible(false)}
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

export default AddAchievementScreen

const styles = StyleSheet.create({
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
    dropdown: { 
        height: 50, 
        borderWidth: 1, 
        borderColor: '#ccc', 
        backgroundColor: theme.colors.lightBg,
        borderRadius: 8, 
        paddingHorizontal: 10,
        marginBottom: 24,
    },
    placeholderStyle: { 
        fontSize: typography.fontSize.md, 
        color: '#747373' 
    },
    selectedTextStyle: { fontSize: 14 },
    input: { height: 50, backgroundColor: 'transparent' },
    required: { color: 'red', marginBottom: 5 },
    formContainer: {
        padding: 16,
      },
      label: {
        fontSize: 14,
        lineHeight: 18,
        color: '#303841',
        marginBottom: 8,
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