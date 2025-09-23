import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.88c08c25390c4acea35d73ce504f835f',
  appName: 'canteen-clarity',
  webDir: 'dist',
  server: {
    url: 'https://88c08c25-390c-4ace-a35d-73ce504f835f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION']
    }
  }
};

export default config;