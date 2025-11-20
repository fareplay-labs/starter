// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { FancyBorder } from '../index'

/**
 * Demo component showing various ways to use FancyBorder
 */
const SimpleDemo: React.FC = () => {
  return (
    <DemoContainer>
      <DemoHeader>FancyBorder Demo</DemoHeader>

      <DemoSection>
        <SectionHeader>Basic Usage</SectionHeader>
        <FancyBorder color='#3498db' width='2px' radius='4px'>
          <FixedSizeContent>Basic blue border</FixedSizeContent>
        </FancyBorder>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Different Border Styles</SectionHeader>
        <DemoRow>
          <FancyBorder color='#e74c3c' borderStyle='solid' width='3px' radius='4px'>
            <FixedSizeContent>Solid Border</FixedSizeContent>
          </FancyBorder>

          <FancyBorder color='#2ecc71' borderStyle='dashed' width='3px' radius='4px'>
            <FixedSizeContent>Dashed Border</FixedSizeContent>
          </FancyBorder>

          <FancyBorder color='#f39c12' borderStyle='dotted' width='3px' radius='4px'>
            <FixedSizeContent>Dotted Border</FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Different Border Radii</SectionHeader>
        <DemoRow>
          <FancyBorder color='#9b59b6' width='2px' radius='0'>
            <FixedSizeContent>No Radius</FixedSizeContent>
          </FancyBorder>

          <FancyBorder color='#9b59b6' width='2px' radius='8px'>
            <FixedSizeContent>Medium Radius</FixedSizeContent>
          </FancyBorder>

          <FancyBorder color='#9b59b6' width='2px' radius='24px'>
            <FixedSizeContent>Large Radius</FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Gradient Flow Animation</SectionHeader>
        <DemoRow>
          {/* Basic gradient flow with default settings */}
          <FancyBorder
            color='#3498db'
            width='3px'
            radius='8px'
            animated={true}
            animationType='flow'
          >
            <FixedSizeContent>Basic Flow</FixedSizeContent>
          </FancyBorder>

          {/* Custom direction and speed */}
          <FancyBorder
            color='#e74c3c'
            width='3px'
            radius='8px'
            animated={true}
            animationType='flow'
            animationConfig={{
              flowDirection: 45,
              speed: 2,
            }}
          >
            <FixedSizeContent>Fast Diagonal</FixedSizeContent>
          </FancyBorder>

          {/* Custom color stops */}
          <FancyBorder
            color='#2ecc71'
            width='3px'
            radius='8px'
            animated={true}
            animationType='flow'
            animationConfig={{
              colorStops: ['#2ecc71', '#3498db', '#9b59b6', '#2ecc71'],
            }}
          >
            <FixedSizeContent>Rainbow Flow</FixedSizeContent>
          </FancyBorder>
        </DemoRow>

        <DemoRow style={{ marginTop: '20px' }}>
          {/* Different border styles */}
          <FancyBorder
            color='#f39c12'
            width='3px'
            radius='8px'
            borderStyle='dashed'
            animated={true}
            animationType='flow'
          >
            <FixedSizeContent>Dashed Flow</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            color='#9b59b6'
            width='3px'
            radius='24px'
            borderStyle='dotted'
            animated={true}
            animationType='flow'
            animationConfig={{
              colorStops: ['#9b59b6', '#3498db', '#9b59b6'],
              duration: 5,
            }}
          >
            <FixedSizeContent>Dotted Slow Flow</FixedSizeContent>
          </FancyBorder>
        </DemoRow>
      </DemoSection>

      <DemoSection>
        <SectionHeader>Spin Animation</SectionHeader>
        <DemoRow>
          {/* Basic spin with default settings */}
          <FancyBorder
            color='#3498db'
            width='3px'
            radius='8px'
            animated={true}
            animationType='spin'
          >
            <FixedSizeContent>Basic Spin</FixedSizeContent>
          </FancyBorder>

          {/* Custom speed and direction */}
          <FancyBorder
            color='#e74c3c'
            width='3px'
            radius='8px'
            animated={true}
            animationType='spin'
            animationConfig={{
              speed: 2,
              direction: -1,
            }}
          >
            <FixedSizeContent>Fast Counter-Clockwise</FixedSizeContent>
          </FancyBorder>

          {/* Custom color stops */}
          <FancyBorder
            color='#2ecc71'
            width='3px'
            radius='8px'
            animated={true}
            animationType='spin'
            animationConfig={{
              colorStops: ['#2ecc71', '#3498db', '#9b59b6', '#2ecc71'],
            }}
          >
            <FixedSizeContent>Rainbow Spin</FixedSizeContent>
          </FancyBorder>
        </DemoRow>

        <DemoRow style={{ marginTop: '20px' }}>
          {/* Different border styles and shapes */}
          <FancyBorder
            color='#f39c12'
            width='3px'
            radius='8px'
            borderStyle='dashed'
            animated={true}
            animationType='spin'
          >
            <FixedSizeContent>Dashed Spin</FixedSizeContent>
          </FancyBorder>

          <FancyBorder
            color='#9b59b6'
            width='3px'
            radius='50%'
            animated={true}
            animationType='spin'
            animationConfig={{
              colorStops: ['#9b59b6', '#3498db', '#9b59b6'],
              duration: 5,
            }}
          >
            <CircularContent>Circular Spin</CircularContent>
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

const CircularContent = styled.div`
  padding: 10px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #e0e0e0;
  border-radius: 50%;
`

export default SimpleDemo
