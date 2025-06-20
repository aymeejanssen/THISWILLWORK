
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b66b1fa1cccb4617aba6e8de85abf488',
  appName: 'mindease-global-support',
  webDir: 'dist',
  server: {
    url: 'https://b66b1fa1-cccb-4617-aba6-e8de85abf488.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
