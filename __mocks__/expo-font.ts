module.exports = {
  useFonts: jest.fn(() => [true]),
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  unloadAsync: jest.fn(),
  FontFamilies: {
    manropeRegular: 'Manrope_400Regular',
    manropeMedium: 'Manrope_500Medium',
    manropeSemiBold: 'Manrope_600SemiBold',
    manropeBold: 'Manrope_700Bold',
    russoOneRegular: 'RussoOne_400Regular',
    robotoMedium: 'Roboto_500Medium',
    interBold: 'Inter_700Bold',
  },
};
