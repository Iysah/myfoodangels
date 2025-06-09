import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { X } from 'lucide-react-native'
import PageWrapper from '../../../components/wrapper'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'
import { theme } from '../../../config/theme'

const SportsScreen:FC<any> = ({ navigation }) => {
  return (
    <PageWrapper>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
      </TouchableOpacity>
      <Text style={styles.title}>Sports</Text>

      <Text style={styles.subTitle}>List sports your are interested in.</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
      </ScrollView>

    </PageWrapper>
  )
}

export default SportsScreen

const styles = StyleSheet.create({
    container: {
        paddingBottom: 100
    },
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
})