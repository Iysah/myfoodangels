import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Pressable, ScrollView, Image, FlatList } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { ArrowLeft, Bell, ListFilter } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import SearchBar from '../../shared/components/SearchBar'
import { apiClient } from '../../../services/apiClient'
import { Popover, PopoverTrigger, PopoverBody, PopoverClose,PopoverContent, PopoverFooter,PopoverHeader } from '../../../../components/ui/popover'


interface SearchFilters {
  searchType?: string;
  name?: string;
  location?: string;
  type?: string;
  free?: boolean;
  eligibility?: string;
}

const TalentSearchScreen:FC<any> = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(false)
  const [searchResult, setSearchResult] = useState<any[]>([]);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchType: 'scout',
    name: '',
    location: '',
    type: '',
    free: false,
    eligibility: ''
  });

  const [filterVisible, setFilterVisible] = useState(false);

  const handleSearch = async (searchText?: string) => {
    try {
      setLoading(true);
      setPage(1);
      setHasMoreData(true);

      // Merge searchText if provided, else use current filters
      const updatedFilters = {
        ...searchFilters,
        ...(searchText !== undefined ? { name: searchText } : {})
      };
      setSearchFilters(updatedFilters);

      const response = await apiClient.get<any>('/scout/search', {
        params: {
          ...updatedFilters,
          page: 1,
          limit: 10
        }
      });
      console.log('Search response:', response.data);
      console.log('Search response - athletes:', response.data.athlete.athletes);

      setSearchResult(response?.data?.athlete?.athletes || []);
      setError(null);
    } catch (error: any) {
      console.error('Error searching events:', error);
      setError(error.message || 'Failed to search events');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const clearAllFilters = () => {
    setSearchFilters({
      searchType: 'scout',
      name: '',
      location: '',
      type: '',
      free: false,
      eligibility: ''
    });
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
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for Athlete, Performance, filter results"
            style={{ flex: 1 }}
          />
          <TouchableOpacity style={styles.iconWrapper} onPress={toggleFilter}>
            <ListFilter size={20} color={'#000'} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, marginTop: 20 }}>
          <FlatList
            data={searchResult}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                marginBottom: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E9E9E9',
                marginHorizontal: 8,
              }}>
                <Image
                  source={item.profileImg ? { uri: item.profileImg } : require('../../../../assets/app-icon.png')}
                  style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#eee' }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginVertical: 2 }}>
                    {item.location?.city && item.location?.country
                      ? `${item.location.city}, ${item.location.country}`
                      : 'Location not set'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <View style={{
                      backgroundColor: theme.colors.tint,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      marginRight: 8,
                    }}>
                      <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                        {(item.accountType || 'athlete').toLowerCase()}
                      </Text>
                    </View>
                    {item.position ? (
                      <View style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                      }}>
                        <Text style={{ color: '#888', fontSize: 12 }}>{item.position}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#888' }}>No results found.</Text>
              </View>
            }
          />
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={toggleFilter}
      >
        <Pressable style={styles.overlay} onPress={toggleFilter}>
          <View style={styles.filterContainer}>
            <ScrollView>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
                <TouchableOpacity onPress={clearAllFilters}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              </View>

              {/* Category */}
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.chipRow}>
                {['Athlete', 'Trials', 'Events', 'All'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      searchFilters.searchType === cat.toLowerCase() && styles.chipSelected
                    ]}
                    onPress={() => setSearchFilters({ ...searchFilters, searchType: cat.toLowerCase() })}
                  >
                    <Text style={[
                      styles.chipText,
                      searchFilters.searchType === cat.toLowerCase() && styles.chipTextSelected
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location */}
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationInput}>
                <TextInput
                  placeholder="Select location"
                  value={searchFilters.location}
                  onChangeText={loc => setSearchFilters({ ...searchFilters, location: loc })}
                  style={{ flex: 1, color: '#333' }}
                />
              </View>

              {/* Sport Type */}
              <Text style={styles.sectionTitle}>Sport Type</Text>
              <View style={styles.chipRow}>
                {['Football', 'Basketball', 'All'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      searchFilters.type === type.toLowerCase() && styles.chipSelected
                    ]}
                    onPress={() => setSearchFilters({ ...searchFilters, type: type.toLowerCase() })}
                  >
                    <Text style={[
                      styles.chipText,
                      searchFilters.type === type.toLowerCase() && styles.chipTextSelected
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Eligibility */}
              <Text style={styles.sectionTitle}>Eligibility</Text>
              <View style={styles.chipRow}>
                {['Under - 18', 'Professional'].map((el) => (
                  <TouchableOpacity
                    key={el}
                    style={[
                      styles.chip,
                      searchFilters.eligibility === el.toLowerCase() && styles.chipSelected
                    ]}
                    onPress={() => setSearchFilters({ ...searchFilters, eligibility: el.toLowerCase() })}
                  >
                    <Text style={[
                      styles.chipText,
                      searchFilters.eligibility === el.toLowerCase() && styles.chipTextSelected
                    ]}>{el}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 12,
                borderRadius: 24,
                marginTop: 10,
                alignItems: 'center'
              }}
              onPress={() => {
                handleSearch();
                setFilterVisible(false);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaProvider>
  )
}

export default TalentSearchScreen

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
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#EFEFEF',

    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    minHeight: 400,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAll: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: '#333',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  locationInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
})