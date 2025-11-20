// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { FancyBorder } from '../index'

/**
 * Demo component showing gradient border examples
 */
const GradientDemo: React.FC = () => {
  return (
    <DemoContainer>
      <DemoHeader>Gradient Border Demo</DemoHeader>

      <DemoSection>
        <SectionHeader>Two-Color Gradients</SectionHeader>
        <DemoRow>
          <FancyBorder isGradient gradientColors={['#3498db', '#9b59b6']} width='3px' radius='4px'>
            <FixedSizeContent>Horizontal Gradient</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            isGradient
            gradientColors={['#2ecc71', '#f1c40f']}
            gradientDirection='to bottom'
            width='3px'
            radius='4px'
          >
            <FixedSizeContent>Vertical Gradient</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            isGradient
            gradientColors={['#e74c3c', '#f39c12']}
            gradientDirection='45deg'
            width='3px'
            radius='4px'
          >
            <FixedSizeContent>Diagonal Gradient</FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Multi-Color Gradients</SectionHeader>
        <DemoRow>
          <FancyBorder
            isGradient
            gradientColors={['#3498db', '#e74c3c', '#2ecc71']}
            width='4px'
            radius='8px'
          >
            <FixedSizeContent>Three Colors</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            isGradient
            gradientColors={['#9b59b6', '#3498db', '#2ecc71', '#f1c40f']}
            width='4px'
            radius='8px'
          >
            <FixedSizeContent>Four Colors</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            isGradient
            gradientColors={['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db']}
            gradientDirection='135deg'
            width='4px'
            radius='8px'
          >
            <FixedSizeContent>Five Colors</FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Gradient Borders with Different Widths & Radii</SectionHeader>
        <DemoRow>
          <FancyBorder isGradient gradientColors={['#9b59b6', '#3498db']} width='6px' radius='0'>
            <FixedSizeContent>Thick Border</FixedSizeContent>
          </FancyBorder>

          <FancyBorder isGradient gradientColors={['#9b59b6', '#3498db']} width='3px' radius='16px'>
            <FixedSizeContent>Rounded Border</FixedSizeContent>
          </FancyBorder>

          <FancyBorder isGradient gradientColors={['#9b59b6', '#3498db']} width='3px' radius='50%'>
            <CircularContent>Circular Border</CircularContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  )
}

const DemoContainer = styled.div`
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #121212;
  color: #e0e0e0;
`

const DemoHeader = styled.h2`
  color: #f8f8f8;
  margin-bottom: 24px;
`

const SectionHeader = styled.h3`
  color: #f8f8f8;
  margin-bottom: 16px;
`

const DemoSection = styled.section`
  margin-bottom: 30px;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
`

const DemoRow = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`

const FixedSizeContent = styled.div`
  padding: 10px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #e0e0e0;
`

const CircularContent = styled(FixedSizeContent)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
`

export default GradientDemo
