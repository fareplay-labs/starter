interface DeviceSize {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

export const numBP = {
  xs: 400, // for small screen mobile
  sm: 600, // for mobile screen
  md: 912, // for tablets
  lg: 1280, // for laptops
  xl: 1440, // for desktop / monitors
  xxl: 1920, // for big screens
} as const

const sizeBP: DeviceSize = {
  xs: '400px', // for small screen mobile
  sm: '600px', // for mobile screen
  md: '912px', // for tablets
  lg: '1280px', // for laptops
  xl: '1440px', // for desktop / monitors
  xxl: '1920px', // for big screens
} as const

export const deviceBP = {
  xs: `(max-width: ${sizeBP.xs})`,
  sm: `(max-width: ${sizeBP.sm})`,
  md: `(max-width: ${sizeBP.md})`,
  lg: `(max-width: ${sizeBP.lg})`,
  xl: `(max-width: ${sizeBP.xl})`,
  xxl: `(max-width: ${sizeBP.xxl})`,
} as const
