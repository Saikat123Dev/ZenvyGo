import { useThemePreference } from '@/providers/ThemeProvider';

export function useColorScheme() {
	const { colorScheme } = useThemePreference();
	return colorScheme;
}
