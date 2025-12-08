import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../select'
import { Label } from '../label'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="game-select">Select Game</Label>
      <Select>
        <SelectTrigger id="game-select" className="w-[200px]">
          <SelectValue placeholder="Choose a game" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="slots">Slots</SelectItem>
          <SelectItem value="plinko">Plinko</SelectItem>
          <SelectItem value="crash">Crash</SelectItem>
          <SelectItem value="dice">Dice</SelectItem>
          <SelectItem value="coinflip">Coin Flip</SelectItem>
          <SelectItem value="roulette">Roulette</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const MultipleGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a game" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Classic Games</SelectLabel>
          <SelectItem value="dice">Dice</SelectItem>
          <SelectItem value="coinflip">Coin Flip</SelectItem>
          <SelectItem value="roulette">Roulette</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Skill Games</SelectLabel>
          <SelectItem value="plinko">Plinko</SelectItem>
          <SelectItem value="crash">Crash</SelectItem>
          <SelectItem value="slots">Slots</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}
