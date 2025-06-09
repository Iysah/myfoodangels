import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#000080',
    secondary: '#FFC107',
    success: '#4CAF50',
    error: '#B90000',
    warning: '#FF9800',
    background: '#FFFFFF',
    lightBg: "#F8F8F8",
    surface: '#F5F5F5',
    borderColor: '#E1E1E1',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  layout: {
    screenWidth: width,
    screenHeight: height,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    rounded: 100
  },
}; 