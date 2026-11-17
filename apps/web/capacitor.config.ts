import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.karanjaghadge.local',
  appName: 'Karanjaghadge Local',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
