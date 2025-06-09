import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AthleteCard from './AthleteCard';
import { featuredAthletes } from '../../../data/atheletes';
import { spacing } from '../../../config/spacing';
import { useNavigation } from '@react-navigation/native'

const AthleteList = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {featuredAthletes.map((athlete, index) => (
        <View key={index} style={styles.cardContainer}>
          <AthleteCard
            fullName={athlete.fullName}
            location={athlete.location}
            sport={athlete.sport}
            position={athlete.position}
            imageUrl={athlete.image}
            description={athlete.description}
            onPress={() => (navigation as any).navigate('TalentDetails', {athleteId: athlete.id})}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default AthleteList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
}); 