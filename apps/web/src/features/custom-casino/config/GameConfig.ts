// @ts-nocheck
import { type IConfig } from './IConfig'
import { type PageConfig } from './PageConfig'

export type BaseGameParameters = Record<string, any>

export interface IGameConfigData<T extends BaseGameParameters = any> {
  type?: string
  name?: string
  icon?: string
  description?: string
  layout?: string
  colors?: {
    themeColor1?: string
    themeColor2?: string
    themeColor3?: string
  }
  window?: {
    width?: string
    height?: string
    backgroundColor?: string
  }
  parameters?: Partial<T>
}

export abstract class GameConfig<T extends BaseGameParameters> implements IConfig {
  name = 'Default Game'
  icon = ''
  description = ''
  layout = 'default'
  colors: { themeColor1?: string; themeColor2?: string; themeColor3?: string } = {
    themeColor1: undefined,
    themeColor2: undefined,
    themeColor3: undefined,
  }
  window: { width: string; height: string; backgroundColor: string } = {
    width: '600px',
    height: '400px',
    backgroundColor: '#1a1a1a',
  }

  protected parameters: T

  // Optional reference to a PageConfig to inherit cascading defaults
  parentPage?: PageConfig

  constructor() {
    this.parameters = this.getDefaultParameters()
  }

  load(data: IGameConfigData<T>): void {
    if (data.name !== undefined) this.name = data.name
    if (data.icon !== undefined) this.icon = data.icon
    if (data.description !== undefined) this.description = data.description
    if (data.layout !== undefined) this.layout = data.layout
    if (data.colors) {
      if (data.colors.themeColor1 !== undefined) this.colors.themeColor1 = data.colors.themeColor1
      if (data.colors.themeColor2 !== undefined) this.colors.themeColor2 = data.colors.themeColor2
      if (data.colors.themeColor3 !== undefined) this.colors.themeColor3 = data.colors.themeColor3
    }
    if (data.window) {
      if (data.window.width !== undefined) this.window.width = data.window.width
      if (data.window.height !== undefined) this.window.height = data.window.height
      if (data.window.backgroundColor !== undefined)
        this.window.backgroundColor = data.window.backgroundColor
    }
    if (data.parameters) {
      this.updateParameters(data.parameters)
    }
  }

  protected abstract getDefaultParameters(): T

  public getParameters(): T {
    return { ...this.parameters }
  }

  public updateParameters(newParams: Partial<T>): boolean {
    if (this.validateParameters(newParams)) {
      this.parameters = { ...this.parameters, ...newParams }
      return true
    }
    return false
  }

  protected abstract validateParameters(params: Partial<T>): boolean

  save(): IGameConfigData<T> {
    return {
      name: this.name,
      icon: this.icon,
      description: this.description,
      layout: this.layout,
      colors: { ...this.colors },
      window: { ...this.window },
      parameters: { ...this.parameters },
    }
  }

  validate(): boolean {
    return this.validateParameters(this.parameters)
  }

  apply(): void {
    if (!this.validate()) {
      throw new Error('Invalid configuration')
    }
    this.applyGameSpecific()
  }

  protected abstract applyGameSpecific(): void
}
