import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">XS</AvatarFallback>
      </Avatar>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-sm">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-20 w-20">
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const PlayerList: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <h3 className="text-lg font-semibold">Recent Players</h3>
      <div className="space-y-3">
        {[
          { name: 'Alice', initials: 'AL', wins: 12 },
          { name: 'Bob', initials: 'BO', wins: 8 },
          { name: 'Charlie', initials: 'CH', wins: 5 },
        ].map((player) => (
          <div key={player.name} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{player.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{player.name}</p>
              <p className="text-sm text-muted-foreground">{player.wins} wins</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}
