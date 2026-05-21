import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import { Feather } from '@expo/vector-icons';

/**
 * InputField
 * Props: label, value, onChangeText, placeholder, icon, rightIcon, onRightIconPress,
 *        secureTextEntry, keyboardType, error, editable, style, ...rest
 */
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon = null,
  rightIcon = null,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  error = '',
  editable = true,
  autoCapitalize = 'none',
  maxLength,
  style,
  ...rest
}) => {
  const hasError = !!error;
  const isFilled = value && value.length > 0;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Feather name={icon} size={20} color={Colors.textTertiary} />;
    }
    return icon;
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.container,
        isFilled && styles.containerFilled,
        hasError && styles.containerError,
        !editable && styles.containerDisabled,
      ]}>
        {icon && <View style={styles.leftIcon}>{renderIcon()}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },

  label: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    letterSpacing: 0.2,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  containerFilled: {
    borderColor: Colors.gray300,
  },
  containerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  containerDisabled: {
    backgroundColor: Colors.gray100,
    opacity: 0.7,
  },

  leftIcon: { marginRight: Spacing.sm },
  rightIcon: { marginLeft: Spacing.sm, padding: Spacing.xs },

  input: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  inputWithIcon: {
    marginLeft: Spacing.xs,
  },

  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default InputField;
