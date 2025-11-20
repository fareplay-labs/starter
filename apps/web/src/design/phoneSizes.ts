interface PhoneSize {
  xs: string
  sm: string
  md: string
  lg: string
}

const widthBp: PhoneSize = {
  xs: '360px',
  sm: '375px', //standard iphone
  md: '390px', // Samsung Galaxy S21 & Iphone 12
  lg: '430px', // OnePlus 8 & Samsung Galaxy Note 20
}

export const phoneBP = {
  xs: `(max-width: ${widthBp.xs})`,
  sm: `(max-width: ${widthBp.sm})`,
  md: `(max-width: ${widthBp.md})`,
  lg: `(max-width: ${widthBp.lg})`,
}
