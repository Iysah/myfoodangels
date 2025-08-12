import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { X } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import CustomInput from '../../../components/CustomInput'
import SolidButton from '../../../components/button/solidButton'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'

const EditBioScreen:FC<any> = observer(({ navigation }) => {
  const { userData } = store.auth;

  const [name, setName] = useState<any>(userData?.fullName)
  const [skill, setSkill] = useState<any>(userData?.skill)
  const [position, setPosition] = useState<any>(userData?.position)
  const [country, setCountry] = useState<any>(userData?.country)
  const [city, setCity] = useState<any>(userData?.city)

  const [title, setTitle] = useState('Scout Manager')
  
  const [loading, setLoading] = useState(false)



  const handleUpdate = async () => {
    try {
      setLoading(true);
      await store.auth.addBio({ name, skill, position, country, city });
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error('Update about failed:', error);
      Alert.alert('Error', 'Failed to update bio. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateScoutBio = async () => {
    try {
      setLoading(true);
      await store.scout.updateProfileBio({ 
        name, 
        title, 
        position, 
        country, 
        city 
      });
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error('Update scout bio failed:', error);
      Alert.alert('Error', 'Failed to update bio. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Bio</Text>

        <Text style={styles.subTitle}>Write about yourself to easily discover opportunities, also {store.auth.role?.toLowerCase() === "athlete" ? "Scout" : "Athlete"} can reach you faster.</Text>

        {store.auth.role?.toLowerCase() === "athlete" ? (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <CustomInput
              label="Full Name"
              placeholder=""
              value={name}
              onChangeText={setName}
              keyboardType="default"
              autoCapitalize="none"
            />
    
            <CustomInput
              label="Skill"
              placeholder=""
              value={skill}
              onChangeText={setSkill}
              keyboardType="default"
              autoCapitalize="none"
            />
    
            <CustomInput
              label="Position"
              placeholder=""
              value={position}
              onChangeText={setPosition}
              keyboardType="default"
              autoCapitalize="none"
            />
    
            <Text style={styles.sectionTitle}>Location</Text>
    
    
            <CustomInput
              label="Country/Region"
              placeholder=""
              value={country}
              onChangeText={setCountry}
              keyboardType="default"
              autoCapitalize="none"
            />
    
            <CustomInput
              label="City"
              placeholder=""
              value={city}
              onChangeText={setCity}
              keyboardType="default"
              autoCapitalize="none"
            />
    
            <SolidButton title={store.athlete.isLoading ? 'Saving...' : 'Save'} onPress={handleUpdate} />
          </ScrollView>
         ) : store.auth.role?.toLowerCase() === "scout" ? (
          <View style={styles.container}>
            <CustomInput
              label="Full Name"
              placeholder=""
              value={name}
              onChangeText={setName}
              keyboardType="default"
              autoCapitalize="none"
            />

            <CustomInput
              label="Title"
              placeholder=""
              value={title}
              onChangeText={setTitle}
              keyboardType="default"
              autoCapitalize="none"
            />

            <CustomInput
              label="Postion"
              placeholder=""
              value={position}
              onChangeText={setPosition}
              keyboardType="default"
              autoCapitalize="none"
            />

            <Text style={styles.sectionTitle}>Location</Text>
              
            <CustomInput
              label="Country/Region"
              placeholder=""
              value={country}
              onChangeText={setCountry}
              keyboardType="default"
              autoCapitalize="none"
            />

            <CustomInput
              label="City"
              placeholder=""
              value={city}
              onChangeText={setCity}
              keyboardType="default"
              autoCapitalize="none"
            />

            <SolidButton 
              title={store.scout.isLoading ? 'Saving...' : 'Save'} 
              onPress={handleUpdateScoutBio} 
              isLoading={store.scout.isLoading}
            />
          </View>
         ) 
         : null
        }
      </KeyboardAvoidingView>
    </PageWrapper>
  )
});

export default EditBioScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100
  },
  backBtn: {
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  subTitle: {
    marginBottom: spacing.lg,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
    color: '#515151'
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md
  }
})