/**
 * Theme configuration
 * Exposes design tokens for use in JS
 */
export const theme = {
  colors: {
    primary: '#B45309',
    'primary-hover': '#92400E',
    secondary: '#1E3A8A',
    accent: '#4D7C0F',
    background: {
      main: '#FAF7F2',
      card: '#FFFFFF',
      dark: '#1F1B18',
      'card-dark': '#2A2521',
    },
    text: {
      main: '#2E2A27',
      muted: '#6B635C',
    },
    border: {
      soft: '#E8E2DA',
    },
    success: '#15803D',
    warning: '#CA8A04',
    error: '#B91C1C',
    info: '#2563EB',
    paint: {
      primary: '#B45309',
      blue: '#1E3A8A',
      green: '#4D7C0F',
      neutral: '#E8E2DA',
    },
  },
  fontSize: {
    xs: '13px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '22px',
    '3xl': '28px',
  },
  borderRadius: {
    card: '16px',
    btn: '12px',
    input: '12px',
  },
  spacing: {
    section: '32px',
    card: '20px',
  },
}

export default theme
