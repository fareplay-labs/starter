import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '../sheet'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Right)</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Player One" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@player1" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Left)</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse the casino</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-4">
          <Button variant="ghost" className="justify-start">Home</Button>
          <Button variant="ghost" className="justify-start">Games</Button>
          <Button variant="ghost" className="justify-start">Leaderboard</Button>
          <Button variant="ghost" className="justify-start">Settings</Button>
        </nav>
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet (Bottom)</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Game Details</SheetTitle>
          <SheetDescription>View game statistics</SheetDescription>
        </SheetHeader>
        <div className="py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Total Plays</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">52.3%</p>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold">456.78</p>
            <p className="text-sm text-muted-foreground">SOL Wagered</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const MobileMenu: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Fare Casino</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 py-4">
          <Button variant="ghost" className="justify-start">Dashboard</Button>
          <Button variant="ghost" className="justify-start">My Casino</Button>
          <Button variant="ghost" className="justify-start">Discover</Button>
          <Button variant="ghost" className="justify-start">Play Games</Button>
          <hr className="my-2" />
          <Button variant="ghost" className="justify-start">Settings</Button>
          <Button variant="ghost" className="justify-start text-red-500">Disconnect</Button>
        </nav>
      </SheetContent>
    </Sheet>
  ),
}
