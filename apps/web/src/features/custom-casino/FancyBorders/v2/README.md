# FancyBorders V2

A simple and flexible React library for adding visually appealing borders to any component.

## Usage

```jsx
import { FancyBorder } from 'path/to/FancyBorders/v2';

// Basic usage
<FancyBorder color="#3498db" width="2px" radius="4px">
  <div>Your content here</div>
</FancyBorder>

// Gradient border
<FancyBorder 
  isGradient 
  gradientColors={['#3498db', '#9b59b6']} 
  width="3px" 
  radius="8px"
>
  <div>Content with gradient border</div>
</FancyBorder>

// Animated border with type-specific configuration
<FancyBorder 
  color="#3498db"
  width="3px" 
  radius="8px"
  animated
  animationType="pulse"
  animationConfig={{
    duration: 1.5,
    intensity: 1.2,
    minOpacity: 0.2,
    maxOpacity: 0.9
  }}
>
  <div>Content with animated pulsing border</div>
</FancyBorder>

// With entry animation
<FancyBorder
  color="#3498db"
  width="3px"
  radius="8px"
  entryAnimation
  entryAnimationConfig={{
    duration: 1.2,
    delay: 0.2,
    cornerSize: 15
  }}
>
  <div>Border with entry animation</div>
</FancyBorder>
```
 I do.
## Props

| Prop                 | Type                | Default     | Description                               |
|----------------------|---------------------|-------------|-------------------------------------------|
| color                | string              | '#000'      | Border color (any valid CSS color)        |
| width                | string              | '2px'       | Border width                              |
| borderStyle          | string              | 'solid'     | Border style (solid, dashed, dotted, etc.)|
| radius               | string              | '0px'       | Border radius                             |
| className            | string              | ''          | Additional CSS classes                    |
| isGradient           | boolean             | false       | Enable gradient border                    |
| gradientColors       | string[]            | []          | Array of colors for gradient border       |
| gradientDirection    | string              | 'to right'  | Direction of gradient (e.g., '45deg')     |
| animated             | boolean             | false       | Enable border animation                   |
| animationType        | string              | 'pulse'     | Type of animation ('pulse', 'flow', 'spin', 'none') |
| animationConfig      | AnimationConfig     | {}          | Type-specific animation configuration     |
| animateOnHoverOnly   | boolean             | false       | Whether animations only run on hover      |
| entryAnimation       | boolean             | false       | Enable entry animation                    |
| entryAnimationConfig | EntryAnimationConfig| {}          | Entry animation configuration             |

## Gradient Borders

The `FancyBorder` component supports gradient borders with multiple colors. To enable gradient borders:

1. Set `isGradient` to `true`
2. Provide an array of colors in `gradientColors`
3. Optionally set a `gradientDirection` (e.g., 'to right', 'to bottom', '45deg')

Example:
```jsx
<FancyBorder 
  isGradient 
  gradientColors={['#3498db', '#e74c3c', '#2ecc71']} 
  gradientDirection="45deg"
  width="3px" 
  radius="8px"
>
  <div>Multi-color gradient border</div>
</FancyBorder>
```

## Animated Borders

The `FancyBorder` component supports animated borders for enhanced visual effects using a flexible configuration system based on animation type.

You can control when animations are active with the `animateOnHoverOnly` prop:
- When `false` (default): Animations run continuously 
- When `true`: Animations only activate when the user hovers over the component

Example with hover-only animation:
```jsx
<FancyBorder
  color="#3498db"
  width="3px"
  radius="8px"
  animated
  animationType="pulse"
  animateOnHoverOnly={true}
  animationConfig={{
    duration: 1.5,
    intensity: 1.2
  }}
>
  <div>Border that animates on hover</div>
</FancyBorder>
```

### Animation Types

#### Pulse Animation

The pulse animation creates a glowing effect that pulses the border's opacity and adds a glow effect.

Configuration options:
- `duration`: Animation duration in seconds (default: 1.5)
- `intensity`: Animation intensity, affects glow size (default: 1)
- `minOpacity`: Minimum opacity value for the animation (default: 0)
- `maxOpacity`: Maximum opacity value for the animation (default: 1)
- `defaultMaxOpacity`: Whether to use maximum opacity for the default state when not hovered (default: false)

Example:
```jsx
<FancyBorder
  color="#3498db"
  width="3px"
  radius="8px"
  animated
  animationType="pulse"
  animateOnHoverOnly={true}
  animationConfig={{
    duration: 1.5,
    intensity: 1.2,
    minOpacity: 0.2,
    maxOpacity: 0.9,
    defaultMaxOpacity: true
  }}
>
  <div>Border with pulse animation</div>
</FancyBorder>
```

By adjusting the `minOpacity` and `maxOpacity` values, you can create more subtle or pronounced animation effects. For example, setting `minOpacity={0.3}` will ensure the border never fully fades out.

When `animateOnHoverOnly` is set to `true`, the `defaultMaxOpacity` option controls the default appearance:
- When `defaultMaxOpacity` is `false` (default): Border appears at a low opacity when not hovered, and the animation starts from minimum opacity and increases to maximum
- When `defaultMaxOpacity` is `true`: Border appears at maximum opacity when not hovered, and the animation starts from maximum opacity and decreases to minimum

This allows you to control both the default appearance and the direction of the pulse animation.

#### Flow Animation

The flow animation creates a continuous moving gradient that flows around the border, creating a dynamic and eye-catching effect.

Configuration options:
- `duration`: Animation duration in seconds (default: 3)
- `speed`: Animation speed multiplier (default: 1)
- `flowDirection`: Direction of the gradient flow in degrees (default: 90)
- `colorStops`: Array of colors for the gradient (defaults to variations of the border color or provided gradient colors)

Example:
```jsx
<FancyBorder
  color="#3498db"
  width="3px"
  radius="8px"
  animated
  animationType="flow"
  animationConfig={{
    duration: 3,
    speed: 1.5,
    flowDirection: 45,
    colorStops: ['#3498db', '#9b59b6', '#2ecc71', '#3498db']
  }}
>
  <div>Border with flowing gradient animation</div>
</FancyBorder>
```

The `flowDirection` property controls the angle of the gradient flow, creating different movement patterns. The `speed` property allows you to speed up or slow down the animation, while `colorStops` gives you precise control over the gradient colors.

#### Spin Animation

The spin animation creates a rotating conic gradient that spins around the border, creating a dynamic radial effect.

Configuration options:
- `duration`: Animation duration in seconds (default: 4)
- `speed`: Animation speed multiplier (default: 1)
- `direction`: Rotation direction (1: clockwise, -1: counter-clockwise)
- `colorStops`: Array of colors for the gradient (defaults to variations of the border color or provided gradient colors)

Example:
```jsx
<FancyBorder
  color="#3498db"
  width="3px"
  radius="8px"
  animated
  animationType="spin"
  animationConfig={{
    duration: 4,
    speed: 1.5,
    direction: -1,
    colorStops: ['#3498db', '#9b59b6', '#2ecc71', '#3498db']
  }}
>
  <div>Border with spinning gradient animation</div>
</FancyBorder>
```

The `direction` property controls whether the gradient spins clockwise or counter-clockwise. The `speed` property allows you to speed up or slow down the animation, while `colorStops` gives you precise control over the gradient colors.

### Entry Animation Integration

When both pulse animation and entry animation are used together, the pulse animation will only begin after the entry animation has completed. This sequential animation creates a smoother effect and prevents visual conflicts between animations.

## Entry Animation

The FancyBorder component supports an elegant entry animation that can be configured and triggered on demand.

```jsx
<FancyBorder
  color="#f56565"
  width="4px"
  radius="8px"
  entryAnimation={true}
  entryAnimationConfig={{
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    cornerSize: 15, // Size of initial corner reveal in pixels
    trigger: triggerCount,
    onComplete: () => console.log('Animation complete')
  }}
>
  <div>Content with entry animation</div>
</FancyBorder>
```

### Corners-to-Center Animation

The corners-to-center animation reveals the border starting from the corners and moving inward toward the center of each edge. This creates a smooth reveal effect that draws attention to the border.

- Use `cornerSize` to control how much of the corners are initially visible (in pixels)
- The animation completes by filling in toward the center of each border edge

### Entry Animation Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| entryAnimation | boolean | false | Enable/disable entry animation |
| entryAnimationConfig.duration | number | 1 | Animation duration in seconds |
| entryAnimationConfig.delay | number | 0 | Animation delay in seconds |
| entryAnimationConfig.easing | string | 'ease-in-out' | Animation timing function (ease, ease-in, ease-out, ease-in-out, linear, smooth, or custom cubic-bezier) |
| entryAnimationConfig.trigger | any | undefined | When this value changes, the animation will play again |
| entryAnimationConfig.onComplete | function | undefined | Callback function when animation completes |
| entryAnimationConfig.cornerSize | number | 0 | Size in pixels for the initial corner reveal |

## Dark Theme Support

The component comes with a dark theme that works well in dark interfaces. The inner content has a dark background by default.

## Demo

Check out the demo components for examples:
- `demo/SimpleDemo.tsx` - Basic border examples
- `demo/GradientDemo.tsx` - Gradient border examples
- `demo/AnimationDemo.tsx` - Animated border examples with interactive controls
