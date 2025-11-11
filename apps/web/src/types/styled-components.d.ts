declare module 'styled-components' {
  import * as React from 'react'

  type StyledComponentProps = {
    className?: string
    children?: React.ReactNode
    [key: string]: any
  }

  type StyledTag<TProps extends object = StyledComponentProps> = React.FC<TProps>

  interface StyledFactory {
    <T extends keyof JSX.IntrinsicElements | React.ComponentType<any>>(
      component: T
    ): any
    div: any
    span: any
    section: any
    header: any
    footer: any
    main: any
    nav: any
    button: any
    input: any
  }

  export const styled: StyledFactory & Record<string, any>
  export function keyframes(strings: TemplateStringsArray, ...args: any[]): string
  export function css(strings: TemplateStringsArray, ...args: any[]): string
  export function createGlobalStyle(strings: TemplateStringsArray, ...args: any[]): React.FC

  export default styled
}
