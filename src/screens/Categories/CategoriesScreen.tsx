import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import { Category } from '../../types';

const CategoriesScreen = observer(() => {
  const navigation = useNavigation();
  const { productStore } = useStores();

  useEffect(() => {
    // Load categories if not already loaded
    if (!productStore.categories.length && !productStore.categoriesLoading) {
      productStore.fetchCategories();
    }
  }, []);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => {
        // Navigate to products filtered by category
        navigation.navigate('Products', {
          category: {
            id: item.id,
            name: item.name,
            loystarId: item.loystarId || 0,
            image: item.image,
          }
        });
      }}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/100' }} 
        style={styles.categoryImage}
      />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={Colors.label} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Categories Grid */}
      <FlatList
        data={productStore.categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.categoriesGrid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
});

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  categoriesGrid: {
    padding: Spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 6,
    padding: Spacing.sm,
    alignItems: 'center',
    flex: 1,
    maxWidth: '30%',
  },
  categoryImage: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    textAlign: 'center',
  },
});