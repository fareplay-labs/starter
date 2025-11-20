// @ts-nocheck
export interface IConfig {
  load(data: any): void
  save(): any
  validate(): boolean
  apply(): void
}
