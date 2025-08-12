import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '../../../services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { ArrowRight, ChevronRight } from 'lucide-react-native';

const ProfileCompletion = ({ onClose, onPress }: { onClose: () => void, onPress: () => void }) => {
  const [percent, setPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const res = await apiClient.get<{ data: number }>('/auth/profile-completed');
        console.log(res.data, 'profile data')
        setPercent(res.data);
      } catch (e) {
        setPercent(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletion();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.inner} onPress={onPress}>
        <View style={{ flex: 1, flexDirection: 'column', paddingRight: 20 }}>
          <View style={styles.row}>
            <Text style={styles.title}>Complete Profile</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#222" />
            ) : (
              <Text style={styles.percent}>{percent ?? 0}% complete</Text>
            )}
            
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${percent ?? 0}%` }]} />
          </View>
        </View>

        <ChevronRight size={24} color="#222" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 2,
    backgroundColor: '#111',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  percent: {
    color: '#222',
    fontSize: 12,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E9E9F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#12007A',
    borderRadius: 6,
  },
});

export default ProfileCompletion;