import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import CustomInput from '../../../components/CustomInput'
import { theme } from '../../../config/theme'
import { X } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import SolidButton from '../../../components/button/solidButton'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'

const AddStatisticsScreen:FC<any> = observer(({ navigation }) => {
  const { userData } = store.auth;
  const [height, setHeight] = useState<any>(userData?.height)
  const [weight, setWeight] = useState<any>(userData?.weight)
  const [bodyFat, setBodyFat] = useState<any>(userData?.bodyFat)
  const [bmi, setBmi] = useState<any>(userData?.bmi)
  const [maxHeart, setMaxHeart] = useState<any>(userData?.maxHeart)
  const [v02max, setV02max] = useState<any>(userData?.v02max)
  const [sprint, setSprint] = useState<any>(userData?.sprint)
  const [vertical, setVertical] = useState<any>(userData?.vertical)
  const [agility, setAgility] = useState<any>(userData?.agility)

  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    try {
      // console.log(title, date, sport, description)
      setLoading(true)
      await store.auth.addStatistics({
        height,
        weight,
        bodyFat,
        BMI: bmi,
        maxHeight: maxHeart,
        v02Max: v02max,
        sprintSpeed: sprint,
        verticalJump: vertical,
        agility
      })
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error('Update about failed:', error);
      Alert.alert('Error', 'Failed to add achievement. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
      </TouchableOpacity>
      <Text style={styles.title}>Edit Statistics</Text>

      <Text style={styles.subTitle}>Write about yourself to easily discover opportunities, also Scout can reach you faster.</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        

        <CustomInput
          label="Height (ft)"
          placeholder=""
          value={height}
          onChangeText={setHeight}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <CustomInput
          label='Weight (kg)'
          placeholder=''
          value={weight}
          onChangeText={setWeight}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='Body Fat'
          placeholder=''
          value={bodyFat}
          onChangeText={setBodyFat}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='BMI'
          placeholder=''
          value={bmi}
          onChangeText={setBmi}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='Max Heart Rate (%)'
          placeholder=''
          value={maxHeart}
          onChangeText={setMaxHeart}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='VO2 Max'
          placeholder=''
          value={v02max}
          onChangeText={setV02max}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='Sprint Speed (km/h)'
          placeholder=''
          value={sprint}
          onChangeText={setSprint}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='Vertical Jump (ft)'
          placeholder=''
          value={vertical}
          onChangeText={setVertical}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <CustomInput
          label='Agility'
          placeholder=''
          value={agility}
          onChangeText={setAgility}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <SolidButton title={loading ? 'saving...' : 'Save'} onPress={handleUpdate} />

      </ScrollView>
    </PageWrapper>
  )
});

export default AddStatisticsScreen

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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