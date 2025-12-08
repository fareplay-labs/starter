# Component Guidelines

This document outlines the standards and best practices for building UI components in the Fare Casino frontend.

## Quick Reference

| I'm building... | Use... |
|-----------------|--------|
| A new page or feature | Tailwind CSS + shadcn/ui |
| A modal/dialog | `<Dialog>` from shadcn |
| A form | shadcn Input, Label, Select, Checkbox |
| Navigation/menus | `<DropdownMenu>` or `<Sheet>` from shadcn |
| A game component | styled-components (existing pattern) |
| Complex animations | styled-components + Framer Motion |

---

## Available shadcn/ui Components

All components are available from `@/components/ui` or the barrel export `@/components/ui/index`:

### Layout & Structure
- **Card** - Container with header, content, footer sections
- **Separator** - Horizontal or vertical divider
- **Sheet** - Slide-out panel (mobile menu, side panels)
- **Tabs** - Tabbed interface

### Forms & Inputs
- **Button** - Primary interactive element (6 variants, 4 sizes)
- **Input** - Text input field
- **Label** - Form field label
- **Checkbox** - Boolean toggle
- **Select** - Dropdown selection
- **Slider** - Range input

### Feedback & Overlays
- **Dialog** - Modal dialogs
- **Popover** - Floating content panels
- **Badge** - Status indicators and labels
- **toast** - Toast notifications (via Sonner)

### Data Display
- **Avatar** - User profile images with fallback

### Usage Example

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter name" />
        </div>
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Styling Guidelines

### 1. Use the `cn()` Utility for Conditional Classes

```tsx
import { cn } from '@/lib/utils';

// Merges classes intelligently, handles conflicts
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // Allow parent override
)}>
```

### 2. Follow the Spacing Scale

Use Tailwind's spacing scale consistently:

```tsx
// Prefer consistent spacing
<div className="p-4">        {/* 16px padding */}
<div className="p-6">        {/* 24px padding */}
<div className="gap-4">      {/* 16px gap */}
<div className="space-y-4">  {/* 16px vertical spacing */}
```

### 3. Use Semantic Color Classes

```tsx
// Use semantic colors for consistency
<div className="bg-background">       {/* Main background */}
<div className="bg-card">             {/* Card background */}
<div className="text-foreground">     {/* Primary text */}
<div className="text-muted-foreground"> {/* Secondary text */}
<div className="border-border">       {/* Default border */}

// Casino-specific colors
<div className="bg-casino-dark">      {/* Dark background */}
<div className="text-casino-accent">  {/* Gold accent */}
<div className="bg-casino-green">     {/* Success/win */}
<div className="bg-casino-red">       {/* Error/loss */}
```

### 4. Responsive Design

```tsx
// Mobile-first approach
<div className="flex flex-col md:flex-row">
<div className="w-full md:w-1/2 lg:w-1/3">
<div className="text-sm md:text-base lg:text-lg">
```

---

## Component Patterns

### Pattern 1: Page Layout

```tsx
export function PageLayout({ title, children }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  );
}
```

### Pattern 2: Form Section

```tsx
export function FormSection({ title, description, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: Confirmation Dialog

```tsx
export function ConfirmDialog({ open, onOpenChange, onConfirm, title, description }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 4: Loading State

```tsx
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
```

### Pattern 5: Empty State

```tsx
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

## File Organization

### New Components

Place new components in the appropriate location:

```
src/
├── components/
│   ├── ui/           # shadcn/ui base components (don't modify)
│   └── [feature]/    # Feature-specific components
├── features/
│   └── [feature]/
│       └── components/  # Feature-specific components
```

### Component File Structure

```tsx
// ComponentName.tsx

// 1. Imports
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 2. Types
interface ComponentNameProps {
  title: string;
  className?: string;
}

// 3. Component
export function ComponentName({ title, className }: ComponentNameProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* content */}
    </div>
  );
}

// 4. Sub-components (if any)
ComponentName.SubComponent = function SubComponent() {
  return <div />;
};
```

---

## Do's and Don'ts

### DO

- Use shadcn components when available
- Use the `cn()` utility for class merging
- Follow the design token system (colors, spacing)
- Write responsive styles mobile-first
- Add TypeScript types for all props
- Use Lucide icons consistently

### DON'T

- Don't modify files in `src/components/ui/` directly
- Don't use arbitrary values when Tailwind classes exist
- Don't mix styled-components and Tailwind in the same element
- Don't hardcode colors - use CSS variables
- Don't forget to handle loading and error states

---

## Adding New shadcn Components

If you need a component not yet installed:

```bash
# From apps/web directory
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

After adding, update the barrel export in `src/components/ui/index.ts`.

---

## Storybook

View all components in Storybook:

```bash
npm run storybook
```

When creating new components, add corresponding stories:

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // default props
  },
};
```

---

## Questions?

- **Migration help:** See `MIGRATION_PLAYBOOK.md`
- **shadcn docs:** https://ui.shadcn.com
- **Tailwind docs:** https://tailwindcss.com/docs
- **Lucide icons:** https://lucide.dev/icons
