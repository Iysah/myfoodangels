import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../../config/theme';
import { GLOBALSTYLES } from '../../../styles/globalStyles';

interface SettingsHeaderProps {
  navigation: any;
  title: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ navigation, title }) => (
  <View style={GLOBALSTYLES.header}>
    <View style={styles.row}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ArrowLeft color={theme.colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
});

export default SettingsHeader; 