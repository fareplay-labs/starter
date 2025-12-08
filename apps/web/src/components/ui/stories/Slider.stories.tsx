import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from '../slider'
import { Label } from '../label'
import { useState } from 'react'

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="flex justify-between">
        <Label>Volume</Label>
        <span className="text-sm text-muted-foreground">50%</span>
      </div>
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const Range: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <Label>Price Range</Label>
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),
}

export const BetAmount: Story = {
  render: function BetAmountStory() {
    const [value, setValue] = useState([0.1])
    return (
      <div className="w-[300px] space-y-4">
        <div className="flex justify-between">
          <Label>Bet Amount</Label>
          <span className="text-sm font-mono">{value[0].toFixed(2)} SOL</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          min={0.01}
          max={10}
          step={0.01}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.01 SOL</span>
          <span>10 SOL</span>
        </div>
      </div>
    )
  },
}

export const Multiplier: Story = {
  render: function MultiplierStory() {
    const [value, setValue] = useState([2])
    return (
      <div className="w-[300px] space-y-4">
        <div className="flex justify-between">
          <Label>Target Multiplier</Label>
          <span className="text-sm font-mono text-casino-accent">{value[0].toFixed(2)}x</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          min={1.01}
          max={100}
          step={0.01}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
}
