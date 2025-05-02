import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tiempodescanso.app',
  appName: 'Tiempo Descanso',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#3880ff"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FFFFFF'
    }
  }
};

export default config;
