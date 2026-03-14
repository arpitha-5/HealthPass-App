import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme/index';

/**
 * Avatar
 * Props: name, image, size, backgroundColor, style, onPress
 */
const Avatar = ({ name = '', image, size = 48, backgroundColor, style, onPress }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  const bg = backgroundColor || Colors.primary;
  const textSize = size * 0.38;

  const Content = (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }, style]}>
      {image ? (
        <Image 
          source={typeof image === 'string' ? { uri: image } : image} 
          style={{ width: size, height: size, borderRadius: size / 2 }} 
        />
      ) : initials ? (
        <Text style={[styles.initials, { fontSize: textSize }]}>{initials}</Text>
      ) : (
        <MaterialCommunityIcons name="account" size={size * 0.55} color={Colors.white} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});

export default Avatar;
