/**
 * Doctor Card Component
 * Display doctor information in a professional card
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CardComponent from './CardComponent';
import Colors from '../theme/Colors';
import { Fonts, Spacing, BorderRadius, Shadows } from '../theme/Typography';

const DoctorCard = ({
  doctor,
  onPress,
  onBookPress,
}) => {
  const {
    id,
    name,
    specialization,
    rating,
    profileImage,
    price,
    experience,
  } = doctor;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
    >
      <CardComponent
        style={styles.cardContainer}
        padding={false}
        elevation="md"
      >
        {/* Doctor Image */}
        <View style={styles.imageContainer}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.doctorImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>👨‍⚕️</Text>
            </View>
          )}
        </View>

        {/* Doctor Info */}
        <View style={styles.infoContainer}>
          {/* Name and Rating */}
          <View style={styles.headerRow}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.specialization}>{specialization}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* Experience */}
          {experience && (
            <Text style={styles.experience}>
              {experience} years experience
            </Text>
          )}

          {/* Price and Button */}
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.priceLabel}>Consultation</Text>
              <Text style={styles.price}>₹{price}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={onBookPress}
              activeOpacity={0.7}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CardComponent>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 0,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },

  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  doctorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagePlaceholderText: {
    fontSize: 60,
  },

  infoContainer: {
    padding: Spacing.lg,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  nameSection: {
    flex: 1,
  },

  name: {
    ...Fonts.h5,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  specialization: {
    ...Fonts.body2,
    color: Colors.primary,
    fontWeight: '600',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },

  ratingIcon: {
    fontSize: 16,
  },

  ratingText: {
    ...Fonts.caption,
    color: Colors.primary,
    fontWeight: '600',
  },

  experience: {
    ...Fonts.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceLabel: {
    ...Fonts.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },

  price: {
    ...Fonts.h5,
    color: Colors.primary,
  },

  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },

  bookButtonText: {
    ...Fonts.buttonSmall,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default DoctorCard;
