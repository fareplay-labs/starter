# Tailwind CSS & shadcn/ui Migration Playbook

This document provides step-by-step guidance for migrating components from styled-components to Tailwind CSS and shadcn/ui in the Fare Casino frontend.

## Table of Contents
1. [Decision Framework](#decision-framework)
2. [Migration Process](#migration-process)
3. [Pattern Conversions](#pattern-conversions)
4. [Component Migration Examples](#component-migration-examples)
5. [Testing Checklist](#testing-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Decision Framework

### When to Use Tailwind CSS / shadcn

Use Tailwind CSS and shadcn/ui components for:

| Scenario | Example |
|----------|---------|
| New features/pages | Settings pages, user profiles |
| Static layouts | Page containers, grids, navigation |
| Standard UI elements | Buttons, inputs, cards, modals |
| Form components | Login forms, settings forms |
| Typography and spacing | Headings, paragraphs, margins |
| Simple hover/focus states | Button hover, input focus |

### When to Keep styled-components

Keep styled-components for:

| Scenario | Example |
|----------|---------|
| Canvas/WebGL rendering | Crash game, Plinko physics |
| Three.js 3D components | CoinFlip coin, Dice models |
| Complex animations | Multi-keyframe sequences, physics-based |
| Dynamic prop-driven styles | `$color`, `$isPlaying`, `$tier` props |
| Game-specific visuals | Reel animations, particle effects |
| Sound-synchronized animations | Slots win celebrations |
| Framer Motion compositions | `styled(motion.div)` patterns |

### Decision Tree

```
Is this a game component (in CustomGames/)?
├── YES → Keep styled-components
└── NO → Continue...

Does it use canvas/WebGL/Three.js?
├── YES → Keep styled-components
└── NO → Continue...

Does it have 3+ dynamic style props ($prop)?
├── YES → Consider hybrid approach or keep styled-components
└── NO → Continue...

Does it have complex keyframe animations (>2)?
├── YES → Evaluate case-by-case (may keep animations in styled-components)
└── NO → Migrate to Tailwind/shadcn

Is there an equivalent shadcn component?
├── YES → Use shadcn component
└── NO → Build with Tailwind CSS
```

---

## Migration Process

### Step 1: Analyze the Component

Before migrating, document:

```markdown
Component: [Name]
Location: [File path]
Styling method: [styled-components / inline / CSS modules]

Dependencies:
- [ ] Uses theme context
- [ ] Uses design tokens
- [ ] Has dynamic props
- [ ] Has animations
- [ ] Has responsive styles

shadcn equivalent: [Yes/No - which component?]
Migration complexity: [Low/Medium/High]
```

### Step 2: Create Parallel Implementation

**Never delete the original component first.** Create a new version alongside:

```
components/
├── MyComponent.tsx           # Original (styled-components)
└── MyComponent.tailwind.tsx  # New (Tailwind/shadcn)
```

### Step 3: Map Styles

Convert styled-components patterns to Tailwind:

```tsx
// BEFORE: styled-components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: #1a1a1a;
  border-radius: 8px;
`;

// AFTER: Tailwind
<div className="flex flex-col gap-4 p-6 bg-casino-card rounded-lg">
```

### Step 4: Test Thoroughly

1. Visual comparison (screenshot both versions)
2. Responsive behavior
3. Interactive states (hover, focus, active)
4. Dark mode appearance
5. Accessibility (keyboard navigation, screen readers)

### Step 5: Swap and Clean Up

```tsx
// Update imports across the codebase
// BEFORE
import { MyComponent } from './MyComponent';

// AFTER
import { MyComponent } from './MyComponent.tailwind';

// Then rename files:
// MyComponent.tsx → MyComponent.styled.tsx (backup)
// MyComponent.tailwind.tsx → MyComponent.tsx
```

---

## Pattern Conversions

### Layout Patterns

| styled-components | Tailwind |
|-------------------|----------|
| `display: flex` | `flex` |
| `flex-direction: column` | `flex-col` |
| `justify-content: center` | `justify-center` |
| `align-items: center` | `items-center` |
| `gap: 16px` | `gap-4` |
| `padding: 24px` | `p-6` |
| `margin: 0 auto` | `mx-auto` |

### Spacing Scale

| Pixels | Tailwind |
|--------|----------|
| 4px | `1` (p-1, m-1, gap-1) |
| 8px | `2` |
| 12px | `3` |
| 16px | `4` |
| 24px | `6` |
| 32px | `8` |
| 48px | `12` |

### Colors (Casino Theme)

| Design Token | Tailwind Class |
|--------------|----------------|
| Dark background | `bg-background` or `bg-casino-dark` |
| Card background | `bg-card` or `bg-casino-card` |
| Border | `border-border` or `border-casino-border` |
| Accent (gold) | `text-casino-accent` or `bg-casino-accent` |
| Success (green) | `text-casino-green` or `bg-casino-green` |
| Error (red) | `text-casino-red` or `bg-casino-red` |
| Primary text | `text-foreground` |
| Muted text | `text-muted-foreground` |

### Typography

| styled-components | Tailwind |
|-------------------|----------|
| `font-size: 14px` | `text-sm` |
| `font-size: 16px` | `text-base` |
| `font-size: 18px` | `text-lg` |
| `font-size: 24px` | `text-2xl` |
| `font-weight: 500` | `font-medium` |
| `font-weight: 600` | `font-semibold` |
| `font-weight: 700` | `font-bold` |

### Responsive Breakpoints

| styled-components | Tailwind |
|-------------------|----------|
| `@media (min-width: 640px)` | `sm:` |
| `@media (min-width: 768px)` | `md:` |
| `@media (min-width: 1024px)` | `lg:` |
| `@media (min-width: 1280px)` | `xl:` |

### Dynamic Styles

**styled-components (prop-based):**
```tsx
const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'primary' ? '#5f5fff' : '#333'};
`;
```

**Tailwind (conditional classes):**
```tsx
import { cn } from '@/lib/utils';

function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  return (
    <button className={cn(
      "px-4 py-2 rounded",
      variant === 'primary' && "bg-primary text-primary-foreground",
      variant === 'secondary' && "bg-secondary text-secondary-foreground"
    )}>
      Click me
    </button>
  );
}
```

**Or use shadcn Button with variants:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
```

### Animation Conversions

**Simple transitions → Tailwind:**
```tsx
// BEFORE
const Box = styled.div`
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

// AFTER
<div className="transition-transform duration-200 hover:scale-105">
```

**Complex keyframes → Keep styled-components or use Framer Motion:**
```tsx
// Complex animations should remain in styled-components
// or migrate to Framer Motion
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

---

## Component Migration Examples

### Example 1: Simple Card Component

**Before (styled-components):**
```tsx
const StyledCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 24px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const CardContent = styled.p`
  color: #aaa;
  font-size: 14px;
`;

export function MyCard({ title, content }) {
  return (
    <StyledCard>
      <CardTitle>{title}</CardTitle>
      <CardContent>{content}</CardContent>
    </StyledCard>
  );
}
```

**After (shadcn/ui):**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyCard({ title, content }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Button with Loading State

**Before (styled-components):**
```tsx
const StyledButton = styled.button<{ $loading?: boolean }>`
  background: ${props => props.$loading ? '#333' : '#5f5fff'};
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  opacity: ${props => props.$loading ? 0.7 : 1};
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
`;
```

**After (shadcn/ui):**
```tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoadingButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

### Example 3: Hybrid Approach (Complex Animation)

When a component has both simple layout AND complex animations:

```tsx
import { Card, CardContent } from '@/components/ui/card';
import styled, { keyframes } from 'styled-components';

// Keep complex animation in styled-components
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const AnimatedIcon = styled.div`
  animation: ${pulse} 2s ease-in-out infinite;
`;

// Use shadcn for structure, styled-components for animation
export function StatusCard({ status }) {
  return (
    <Card className="w-[300px]">
      <CardContent className="flex items-center gap-4 pt-6">
        <AnimatedIcon>
          <StatusIcon status={status} />
        </AnimatedIcon>
        <span className="text-lg font-semibold">{status}</span>
      </CardContent>
    </Card>
  );
}
```

---

## Testing Checklist

Before completing a migration, verify:

### Visual
- [ ] Component looks identical to original
- [ ] Colors match design tokens
- [ ] Spacing is correct
- [ ] Typography is correct
- [ ] Border radius matches

### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] No horizontal overflow

### Interactive
- [ ] Hover states work
- [ ] Focus states work (keyboard navigation)
- [ ] Active/pressed states work
- [ ] Disabled states work

### Accessibility
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible
- [ ] Screen reader announces correctly
- [ ] Keyboard navigation works

### Integration
- [ ] Component works in all usage locations
- [ ] Props behave the same
- [ ] Events fire correctly
- [ ] No console errors

---

## Troubleshooting

### Common Issues

**1. Styles not applying**
```tsx
// Make sure Tailwind classes are complete strings
// BAD
const size = 'lg';
<div className={`text-${size}`}> // Won't work - Tailwind can't detect

// GOOD
<div className={cn(size === 'lg' && 'text-lg')}>
```

**2. CSS specificity conflicts**
```tsx
// If styled-components and Tailwind conflict, use !important sparingly
<div className="!bg-red-500">

// Or wrap in a container with higher specificity
```

**3. Theme colors not working**
```tsx
// Ensure CSS variables are defined in index.css
// Check that component is inside the ThemeProvider
// Verify the variable name matches (--primary vs --casino-primary)
```

**4. Animations not working**
```tsx
// Make sure tailwindcss-animate plugin is installed
// Check that animation classes exist in tailwind.config.js
// For custom animations, add to config:
animation: {
  'custom-spin': 'spin 3s linear infinite',
}
```

### Getting Help

1. Check the shadcn/ui documentation: https://ui.shadcn.com
2. Check Tailwind CSS docs: https://tailwindcss.com/docs
3. View component examples in Storybook: `npm run storybook`
4. Check existing migrated components for patterns

---

## Files Reference

- **Tailwind config:** `/apps/web/tailwind.config.js`
- **CSS variables:** `/apps/web/src/index.css`
- **shadcn config:** `/apps/web/components.json`
- **UI components:** `/apps/web/src/components/ui/`
- **Design tokens:** `/apps/web/src/design/`
- **Utility function:** `/apps/web/src/lib/utils.ts`
