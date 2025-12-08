import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from '../checkbox'
import { Label } from '../label'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Checkbox />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Checked by default</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked" className="text-muted-foreground">
          Disabled unchecked
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked" className="text-muted-foreground">
          Disabled checked
        </Label>
      </div>
    </div>
  ),
}

export const SettingsExample: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <h3 className="text-lg font-semibold">Casino Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="sound" defaultChecked />
          <Label htmlFor="sound">Enable sound effects</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="animations" defaultChecked />
          <Label htmlFor="animations">Enable animations</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="notifications" />
          <Label htmlFor="notifications">Push notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="demo" />
          <Label htmlFor="demo">Demo mode</Label>
        </div>
      </div>
    </div>
  ),
}
