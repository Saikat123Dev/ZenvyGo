import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import { Colors, componentHeights, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
];

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryChange: (country: Country) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChangeText,
  countryCode,
  onCountryChange,
  error,
  label = 'Phone Number',
  placeholder = '50 123 4567',
}: PhoneInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const getBorderColor = () => {
    if (error) return colors.inputError;
    if (isFocused) return colors.inputBorderFocus;
    return colors.inputBorder;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: error ? colors.inputErrorBackground : colors.inputBackground,
          },
        ]}>
        <TouchableOpacity
          style={[styles.countryButton, { borderRightColor: colors.border }]}
          onPress={() => setShowCountryPicker(true)}>
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={[styles.dialCode, { color: colors.text }]}>
            {selectedCountry.dialCode}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {error && <Text style={[styles.error, { color: colors.inputError }]}>{error}</Text>}

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text style={[styles.modalClose, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Search size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search countries..."
              placeholderTextColor={colors.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  { borderBottomColor: colors.border },
                  item.code === selectedCountry.code && {
                    backgroundColor: colors.primaryLighter,
                  },
                ]}
                onPress={() => {
                  onCountryChange(item);
                  setShowCountryPicker(false);
                  setSearchQuery('');
                }}>
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={[styles.countryName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.countryDialCode, { color: colors.textSecondary }]}>
                    {item.dialCode}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.section,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentHeights.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    height: '100%',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.section,
    paddingHorizontal: spacing.component,
    borderRadius: borderRadius.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginStart: 8,
    fontSize: 15,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
    borderBottomWidth: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginEnd: spacing.component,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countryDialCode: {
    fontSize: 14,
    marginTop: 2,
  },
});

export { COUNTRIES };
export type { Country };
export default PhoneInput;
