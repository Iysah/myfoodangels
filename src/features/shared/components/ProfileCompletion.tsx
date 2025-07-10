import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '../../../services/apiClient';
import { Ionicons } from '@expo/vector-icons';

const ProfileCompletion = ({ onClose, onPress }: { onClose: () => void, onPress: () => void }) => {
  const [percent, setPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const res = await apiClient.get<{ data: number }>('/auth/profile-completed');
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
        <View style={styles.row}>
          <Text style={styles.title}>Complete Profile</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#222" />
          ) : (
            <Text style={styles.percent}>{percent ?? 0}% complete</Text>
          )}
          <Ionicons name="chevron-forward" size={20} color="#222" style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${percent ?? 0}%` }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    paddingRight: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  percent: {
    color: '#222',
    fontSize: 14,
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