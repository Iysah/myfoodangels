import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { observer } from 'mobx-react-lite'

const ProductDetailsScreen = observer(() => {
  return (
    <View style={styles.container}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
          <Text>ProductDetailsScreen</Text>
      </SafeAreaProvider>
    </View>
  )
});

export default ProductDetailsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
})
