import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { FC } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { MaterialIcons, Entypo } from '@expo/vector-icons'
import { BriefcaseBusiness, LocateIcon, Mail, MapPin, Pencil, Settings } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { observer } from 'mobx-react-lite'
import { store } from '../../../store/root'
import { typography } from '../../../config/typography'


const ProfileScreen:FC<any> = observer(({ navigation }) => {
  const { userData } = store.auth;

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={GLOBALSTYLES.header}>
          <Text style={GLOBALSTYLES.title}>Profile</Text>

          <TouchableOpacity style={GLOBALSTYLES.iconWrapper} onPress={() => navigation.navigate('Settings')}>
            <Settings size={18} color={theme.colors.text.primary}/>
          </TouchableOpacity> 
        </View>

        <View style={styles.profileWrapper}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => navigation.navigate('EditBio')} style={styles.editBio}>
              <Pencil size={18} color={theme.colors.text.primary}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ProfileUpdate')} style={styles.profileImageWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80' }}
                style={styles.profileImage}
              />
              <View style={styles.statusDot} />
            </TouchableOpacity>
            <Text style={styles.profileName}>{userData?.fullName}</Text>
            <Text style={styles.profileTeam}><BriefcaseBusiness size={16} color={theme.colors.text.primary} /> Super Eagles</Text>
            <Text style={styles.profileRole}>Head Talent Scout</Text>
          </View>

          <View style={styles.profileInfoRow}>
            <MapPin size={18} color="#555" />
            <Text style={styles.profileInfoText}>Lagos, Nigeria</Text>
          </View>

          <View style={styles.profileInfoRow}>
            <Mail size={16} color="#555" />
            <Text style={styles.profileInfoText}>{userData?.email}</Text>
          </View>

          {/* About Section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>About</Text>
      
              <TouchableOpacity onPress={() => navigation.navigate('EditAbout')}>
                <Pencil size={18} color={theme.colors.text.primary}/>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionText}>
              {userData?.about}
            </Text>
          </View>

          {/* Sports Section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Sports</Text>

              <TouchableOpacity onPress={() => navigation.navigate('Sports')}>
                <Pencil size={18} color={theme.colors.text.primary}/>
              </TouchableOpacity>
            </View>
            <View style={styles.tagRow}>
              <View style={styles.sportTag}><Text style={styles.sportTagText}>football</Text></View>
            </View>
          </View>

          {/* Looking For Section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Looking For</Text>

              <TouchableOpacity onPress={() => navigation.navigate('LookingFor')}>
                <Pencil size={18} color={theme.colors.text.primary}/>
              </TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
              <View style={styles.lookingTag}><Text style={styles.lookingTagText}>Striker</Text></View>
              <View style={styles.lookingTag}><Text style={styles.lookingTagText}>Defender</Text></View>
            </View>
            <View style={styles.tagRow}>
              <View style={styles.lookingTag}><Text style={styles.lookingTagText}>Goal Keeper</Text></View>
              <View style={styles.lookingTag}><Text style={styles.lookingTagText}>Mid-fielder</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  )
})

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileWrapper: {
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  editBio: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  statusDot: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444',
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  profileTeam: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    textAlign: 'center',

    marginBottom: spacing.sm,
  },
  profileRole: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing.sm,

    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  profileInfoText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 4,
  },
  sectionBox: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    // marginBottom: 8,
  },
  sectionText: {
    color: '#555',
    fontSize: 15,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sportTag: {
    backgroundColor: '#ececec',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  sportTagText: {
    color: '#444',
    fontSize: typography.fontSize.sm,
  },
  lookingTag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  lookingTagText: {
    color: '#222',
    fontSize: typography.fontSize.sm,
    textTransform: 'capitalize'
  },
})