import React, { FC, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sportsData } from '../../../data/sports';
import { Search, X } from 'lucide-react-native';
import { spacing } from '../../../config/spacing';
import { theme } from '../../../config/theme';
import { typography } from '../../../config/typography';
import { store } from '../../../store/root';
import { useToast } from '../../../../components/ui/toast';

const SportsScreen:FC<any> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();
  
  const filteredSports = sportsData.filter(sport =>
    sport.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (value: string) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleAddSports = async () => {
    if (selected.length === 0) {
      Alert.alert('Error', 'Please select at least one sport.');
      return;
    }

    try {
      console.log('selected', selected);
      await store.scout.updateProfileSports(selected);
      toast({
        title: 'Success',
        description: 'Sports added successfully',
        variant: 'success',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Add sports failed:', error);
      Alert.alert('Error', 'Failed to add sports. Please try again.');
    }
  }

  return (

    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Search size={18} color={'#000'} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sports"
          placeholderTextColor={'#000'}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {filteredSports.map(sport => (
          <TouchableOpacity
            key={sport.value}
            style={styles.row}
            onPress={() => toggleSelect(sport.value)}
          >
            <Text style={styles.label}>{sport.label}</Text>
            <View style={[
              styles.checkbox,
              selected.includes(sport.value) && styles.checkboxSelected
            ]}>
              {selected.includes(sport.value) && <View style={styles.checkmark} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={[styles.doneBtn, store.scout.isLoading && styles.doneBtnDisabled]} 
        onPress={handleAddSports}
        disabled={store.scout.isLoading}
      >
        <Text style={styles.doneText}>
          {store.scout.isLoading ? 'Adding Sports...' : 'Add Sports'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    marginBottom: spacing.lg
  },
  title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: spacing.lg,
  },
  subTitle: {
      marginBottom: spacing.lg,
      fontSize: typography.fontSize.md,
      fontWeight: '400',
      color: '#515151'
  },
  searchContainer: {
    marginBottom: 12,
    marginTop: 8,
    backgroundColor: '#f2f2f2',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    // paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 17,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#222',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#00008B',
    borderColor: '#00008B',
  },
  checkmark: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  doneBtn: {
    backgroundColor: '#00008B',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  doneBtnDisabled: {
    backgroundColor: '#ccc',
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SportsScreen;