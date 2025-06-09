import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { ArrowLeft, Bell, ListFilter } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import SearchBar from '../../shared/components/SearchBar'
import { apiClient } from '../../../services/apiClient'

interface SearchFilters {
  searchType?: string;
  name?: string;
  location?: string;
  type?: string;
  free?: boolean;
  eligibility?: string;
}

const ScoutSearchScreen:FC<any> = ({ navigation }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMOreData, setHasMoreData] = useState(false)
  
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
      searchType: 'scout',
      name: '',
      location: '',
      type: '',
      free: false,
      eligibility: ''
    });
  
  
    const handleSearch = async (searchText: string) => {
      try {
        setLoading(true);
        setPage(1);
        setHasMoreData(true);
  
        const updatedFilters = {
          ...searchFilters,
          name: searchText
        };
        setSearchFilters(updatedFilters);
  
        const response = await apiClient.get<any>('/athlete/trials/search', {
          params: {
            ...updatedFilters,
            page: 1,
            limit: 10
          }
        });
  
  
        setError(null);
      } catch (error: any) {
        console.error('Error searching events:', error);
        setError(error.message || 'Failed to search events');
      } finally {
        setLoading(false);
      }
    };

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={GLOBALSTYLES.wrapper}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Search</Text>
        </View>

        <View style={styles.row}>
          {/* <SearchBar onPress={handleSearch} placeholder= 'Search Athletes, Trials, or Events'  /> */}
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for Talents, Perfomance, filter results"
          />

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate('Notifications')}>
            <ListFilter size={20} color={'#000'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  )
}

export default ScoutSearchScreen



const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 15
  },
  row: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#EFEFEF',

    justifyContent: 'center',
    alignItems: 'center',
  },
})