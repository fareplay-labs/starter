import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-600">Connected</Badge>
      <Badge variant="destructive">Disconnected</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge className="bg-yellow-600">Processing</Badge>
    </div>
  ),
}

export const GameBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Slots</Badge>
      <Badge variant="outline">Plinko</Badge>
      <Badge variant="outline">Crash</Badge>
      <Badge variant="outline">Dice</Badge>
      <Badge variant="outline">Roulette</Badge>
    </div>
  ),
}

export const WithCount: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Messages</span>
      <Badge>5</Badge>
    </div>
  ),
}
