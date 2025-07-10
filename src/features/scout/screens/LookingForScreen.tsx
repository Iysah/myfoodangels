import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { theme } from '../../../config/theme'
import { X } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import CustomInput from '../../../components/CustomInput'
import { store } from '../../../store/root'
import SolidButton from '../../../components/button/solidButton'

const LookingForScreen:FC<any> = ({ navigation }) => {
  const { userData } = store.auth
  const [positions, setPositions] = useState<string>('')
  const [addedPositions, setAddedPositions] = useState<string[]>([])

  const handleAddPosition = () => {
    if (positions.trim()) {
      setAddedPositions(prev => [...prev, positions.trim()])
      setPositions('')
    }
  }

  const handleRemovePosition = (index: number) => {
    setAddedPositions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitPositions = async () => {
    if (addedPositions.length === 0) {
      Alert.alert('Error', 'Please add at least one position.');
      return;
    }

    try {
      await store.scout.addLookFor(addedPositions);
      navigation.goBack();
    } catch (error) {
      console.error('Add positions failed:', error);
      Alert.alert('Error', 'Failed to add positions. Please try again.');
    }
  }

  return (
    <PageWrapper>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
      </TouchableOpacity>
      <Text style={styles.title}>Looking For</Text>

      <Text style={styles.subTitle}>Write about yourself to easily discover opportunities, also Scout can reach you faster.</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <CustomInput
            label="Positions"
            placeholder="Attacking Midfielder"
            value={positions}
            onChangeText={setPositions}
            keyboardType="default"
            autoCapitalize="none"
          />

          <SolidButton title="Add Position" onPress={handleAddPosition} />

          {addedPositions.length > 0 && (
            <View style={styles.positionsContainer}>
              <Text style={styles.positionsTitle}>Added Positions:</Text>
              {addedPositions.map((position, index) => (
                <View key={index} style={styles.positionItem}>
                  <Text style={styles.positionText}>{position}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemovePosition(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {addedPositions.length > 0 && (
            <SolidButton 
              title={store.scout.isLoading ? 'Submitting...' : 'Submit Positions'} 
              onPress={handleSubmitPositions}
              isLoading={store.scout.isLoading}
            />
          )}
      </ScrollView>

    </PageWrapper>
  )
}

export default LookingForScreen

const styles = StyleSheet.create({
  container: {
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
  positionsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  positionsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  positionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  positionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})