import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MEETRACK',
  slug: 'meetrack',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/default-icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/default-splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.meetrack.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/default-adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.meetrack.app'
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/default-favicon.png'
  },
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow MEETRACK to use your location to verify meetings and tasks.'
      }
    ]
  ]
});