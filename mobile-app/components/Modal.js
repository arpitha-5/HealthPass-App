import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize, FontWeight } from '../theme/index';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return styles.sizeSm;
      case 'lg': return styles.sizeLg;
      case 'full': return styles.sizeFull;
      default: return styles.sizeMd;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.container, getSizeStyle()]}>
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.lg,
  },
  sizeSm: { maxHeight: '40%' },
  sizeMd: { maxHeight: '60%' },
  sizeLg: { maxHeight: '80%' },
  sizeFull: { maxHeight: '95%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
});

export default Modal;
