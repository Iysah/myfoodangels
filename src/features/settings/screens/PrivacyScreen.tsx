import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GLOBALSTYLES } from '../../../styles/globalStyles'

const PrivacyScreen:FC<any> = ({ navigation }) => {
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <SettingsHeader title='Privacy Policy' navigation={navigation} />

            <View style={GLOBALSTYLES.wrapper}>
              <Text style={GLOBALSTYLES.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, facere reiciendis quisquam commodi repudiandae explicabo laboriosam earum hic unde rem harum adipisci dolor natus ex, placeat delectus impedit dignissimos ratione quidem veniam, voluptatem deleniti! Reiciendis voluptatibus praesentium maiores inventore exercitationem fuga! Quasi vel repellat id temporibus explicabo eveniet nulla iusto!</Text>

              <Text style={GLOBALSTYLES.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, facere reiciendis quisquam commodi repudiandae explicabo laboriosam earum hic unde rem harum adipisci dolor natus ex, placeat delectus impedit dignissimos ratione quidem veniam, voluptatem deleniti! Reiciendis voluptatibus praesentium maiores inventore exercitationem fuga! Quasi vel repellat id temporibus explicabo eveniet nulla iusto!</Text>

              <Text style={GLOBALSTYLES.text}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, facere reiciendis quisquam commodi repudiandae explicabo laboriosam earum hic unde rem harum adipisci dolor natus ex, placeat delectus impedit dignissimos ratione quidem veniam, voluptatem deleniti! Reiciendis voluptatibus praesentium maiores inventore exercitationem fuga! Quasi vel repellat id temporibus explicabo eveniet nulla iusto!</Text>
            </View>
            
        </ScrollView>
    </SafeAreaProvider>
  )
}

export default PrivacyScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    }
})