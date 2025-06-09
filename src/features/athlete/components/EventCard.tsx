import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Volleyball } from 'lucide-react-native';
import { spacing } from '../../../config/spacing';
import { theme } from '../../../config/theme';
import { formatDate } from '../../../utils/dateFormat';

interface EventCardProps {
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  date: string;
  playerType: string;
  onPress: () => void;
  tag?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  imageUrl,
  title,
  description,
  location,
  date,
  playerType,
  onPress,
  tag = 'Event',
}) => {
  // Validate date before formatting
  const formattedDate = date ? formatDate(date) : 'Date not available';

  return (
    <View style={styles.card}>
      <View>
        <Image 
          source={imageUrl ? { uri: imageUrl } : require('../../../../assets/placeholder.png')} 
          style={styles.image} 
        />
        <View style={styles.tag}>
          <Text style={styles.tagText}>⚚ {tag}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <View style={styles.row}>
          <MapPin size={16} color="#555" />
          <Text style={styles.location}>{location}</Text>
        </View>
        <View style={styles.row}>
          <Calendar size={16} color="#555" />
          <Text style={styles.meta}>{formatDate(date)}</Text>
          <Text style={styles.dot}>•</Text>
          <Volleyball size={16} color="#555" />
          <Text style={styles.meta}>{playerType}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 120,
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F59700',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    padding: 14,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
    textTransform: 'capitalize'
  },
  description: {
    color: '#444',
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  location: {
    marginLeft: 4,
    color: '#555',
    fontSize: 13,
  },
  meta: {
    marginLeft: 4,
    color: '#555',
    fontSize: 13,
    textTransform: 'capitalize'
  },
  dot: {
    marginHorizontal: 6,
    color: '#555',
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D9D9FF',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontSize: 15,
  },
});

export default EventCard;