import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Player One" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@player1" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="games" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="games">Games</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="games" className="p-4">
        <h3 className="font-semibold mb-2">Available Games</h3>
        <p className="text-muted-foreground">Browse and play casino games.</p>
      </TabsContent>
      <TabsContent value="stats" className="p-4">
        <h3 className="font-semibold mb-2">Your Statistics</h3>
        <p className="text-muted-foreground">View your gameplay history and stats.</p>
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        <h3 className="font-semibold mb-2">Casino Settings</h3>
        <p className="text-muted-foreground">Configure your casino preferences.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const SimpleText: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[300px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4">
        Content for Tab 1
      </TabsContent>
      <TabsContent value="tab2" className="p-4">
        Content for Tab 2
      </TabsContent>
      <TabsContent value="tab3" className="p-4">
        Content for Tab 3
      </TabsContent>
    </Tabs>
  ),
}
