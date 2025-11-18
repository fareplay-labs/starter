// @ts-nocheck
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import CroppedImage from '../../../shared/ui/CroppedImage'

const DiceContainer = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12%;
  overflow: hidden;
`

const StyledCroppedImage = styled(CroppedImage)`
  width: 100%;
  height: 100%;
`

interface CustomDiceProps {
  size: number
  rotation: number
  color?: string
}

export const CustomDice: React.FC<CustomDiceProps> = ({ size, rotation, color }) => {
  // Use the default dice image if no color is provided
  const imageData = color || '/src/assets/svg/dice.svg'

  return (
    <DiceContainer
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <StyledCroppedImage imageData={imageData} alt='Custom Dice' width={size} height={size} />
    </DiceContainer>
  )
}
