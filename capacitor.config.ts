import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ru.bestgram.social',
  appName: 'Bestgram Social',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: { androidScheme: 'https' },
}

export default config
