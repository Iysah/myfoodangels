import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { spacing } from '../../../config/spacing';

interface SearchBarProps {
  onPress?: () => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  style?: object;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onPress, 
  onSearch,
  placeholder,
  style
}) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  if (onPress) {
    return (
      <TouchableOpacity style={styles.searchWrapper} onPress={onPress}>
        <Search color={'#000'} size={24} />
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.searchWrapper, style]} activeOpacity={1}>
      <Search color={'#000'} size={24} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        value={searchText}
        onChangeText={handleSearch}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    borderRadius: theme.borderRadius.rounded,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#EAEAEA',
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  placeholderText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    padding: 0,
  }
});

export default SearchBar; 