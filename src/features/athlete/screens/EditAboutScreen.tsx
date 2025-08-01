import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { X } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import PageWrapper from '../../../components/wrapper'
import { spacing } from '../../../config/spacing'
import SolidButton from '../../../components/button/solidButton'
import { store } from '../../../store/root'
import { typography } from '../../../config/typography'
import { observer } from 'mobx-react-lite'
import { useToast } from '../../../../components/ui/toast'

const EditAboutScreen:FC<any> = observer(({ navigation }) => {
    const { userData } = store.auth;
    const [about, setAbout] = useState<any>(userData?.about)
    const { toast } = useToast();
    const handleUpdate = async () => {
        await store.auth.updateAbout(about);
        toast({
            title: 'Success',
            description: 'About updated successfully',
            variant: 'success',
        });
        setAbout('')
    }

  return (
    <PageWrapper>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <X size={32} color={theme.colors.text.primary}/>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Intro</Text>

        <Text style={styles.subTitle}>You can write about yourself, achievements, skills or experiences</Text>

        <TextInput
            style={[styles.textArea, { textAlignVertical: 'top'}]}
            placeholder="Description"
            placeholderTextColor={'#000'}
            value={about}
            onChangeText={setAbout}
            multiline
        />
        <SolidButton title={store.auth.isLoading ? 'Saving...' : 'Save'} onPress={handleUpdate} />
    </PageWrapper>
  )
});

export default EditAboutScreen

const styles = StyleSheet.create({
    backBtn: {
        marginBottom: spacing.lg
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.xl,
    },
    subTitle: {
        marginBottom: spacing.lg,
        fontSize: typography.fontSize.md,
        fontWeight: '400',
        color: '#515151'
    },
    textArea: {
        backgroundColor: '#ededed',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D1D1',
    
        minHeight: 100,
        padding: 10,
        marginTop: spacing.lg,
        fontSize: 15,
        marginBottom: 14,
    
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
      },
})