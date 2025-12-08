import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../input'
import { Label } from '../label'
import { Button } from '../button'
import { Search, Mail } from 'lucide-react'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  render: (args) => <Input {...args} className="w-[300px]" />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="m@example.com" />
    </div>
  ),
}

export const Password: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter password" />
    </div>
  ),
}

export const Number: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="amount">Bet Amount (SOL)</Label>
      <Input id="amount" type="number" placeholder="0.00" step="0.01" min="0" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled input',
  },
  render: (args) => <Input {...args} className="w-[300px]" />,
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search casinos..." className="pl-10" />
    </div>
  ),
}

export const WithButton: Story = {
  render: () => (
    <div className="flex w-[400px] gap-2">
      <Input type="email" placeholder="Enter your email" />
      <Button>Subscribe</Button>
    </div>
  ),
}

export const File: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="logo">Casino Logo</Label>
      <Input id="logo" type="file" accept="image/*" />
    </div>
  ),
}
