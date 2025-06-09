import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TrialCard from './TrialCard'
import { trialsAndEvents } from '../../../data/trials'
import { spacing } from '../../../config/spacing'

const TrialList = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {trialsAndEvents.map((trial, index) => (
        <View key={index} style={styles.cardContainer}>
          <TrialCard
            title={trial.title}
            location={trial.location}
            requests={trial.requests}
            date={trial.date}
            tag={trial.tag}
            onPress={() => {}}
          />
        </View>
      ))}
    </ScrollView>
  )
}

export default TrialList

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardContainer: {
        marginBottom: spacing.md,
    },
})