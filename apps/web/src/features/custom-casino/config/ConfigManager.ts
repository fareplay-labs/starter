// @ts-nocheck
import { type IConfig } from './IConfig'
import { PageConfig, type IPageConfigData } from './PageConfig'

export class ConfigManager {
  private static instance: ConfigManager

  // Registry mapping a config key to a loader function that instantiates the config
  private registry: { [key: string]: (data: any, parent?: IConfig) => IConfig } = {}

  // Loaded configs stored by a key
  private configs: { [key: string]: IConfig } = {}

  private constructor() {
    // Default loader for page config
    this.registerConfig('page', (data: IPageConfigData) => {
      const pageConfig = new PageConfig()
      pageConfig.load(data)
      pageConfig.apply()
      return pageConfig
    })

    // Note: Game configs are now handled through the GameRegistry
    // which uses the new schema-based approach with Zod validation
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }


  /**
   * Registers a loader function for a given config key.
   * @param key Unique identifier for the config type.
   * @param loaderFn Function that takes raw data (and optionally a parent config) and returns an IConfig instance.
   */
  public registerConfig(key: string, loaderFn: (data: any, parent?: IConfig) => IConfig): void {
    this.registry[key] = loaderFn
  }

  /**
   * Loads a config using its registered loader.
   * @param key The config type key (e.g., "page" or "game").
   * @param data Raw JSON data to load the config from.
   * @param parent Optional parent config for cascading defaults.
   * @returns The loaded IConfig instance or null if the key is not registered.
   */
  public loadConfig(key: string, data: any = {}, parent?: IConfig): IConfig | null {
    // Check if we already have this config and it's up to date
    if (this.configs[key]) {
      const existingConfig = this.configs[key]
      const existingData = existingConfig.save()

      // If data is very similar to what we already have, reuse the existing config
      if (JSON.stringify(existingData) === JSON.stringify(data)) {
        return existingConfig
      }
    }

    // Find the appropriate loader based on the key pattern
    const loader = this.findLoader(key)
    if (!loader) {
      return null
    }

    const config = loader(data, parent)
    if (!config.validate()) {
      return null
    }
    this.configs[key] = config
    return config
  }

  /**
   * Find the appropriate loader for a given key, supporting pattern matching
   */
  private findLoader(key: string): ((data: any, parent?: IConfig) => IConfig) | undefined {
    // First try exact match (e.g., 'page', 'dice', 'rps')
    if (this.registry[key]) {
      return this.registry[key]
    }

    // Then try pattern matching for instance-specific keys (e.g., 'dice_userId_instanceId')
    // Regex to match keys like 'gameType_anything_anything'
    const instanceKeyRegex = /^([a-zA-Z0-9]+)_.*_.*$/
    const match = key.match(instanceKeyRegex)

    if (match && match[1]) {
      const baseGameType = match[1] // Extract the game type (e.g., 'dice')
      // Look for the base game type loader in the registry
      if (this.registry[baseGameType]) {
        return this.registry[baseGameType]
      }
    }

    return undefined // No loader found
  }

  /**
   * Retrieves a previously loaded config by its key.
   * If the config doesn't exist but a loader is registered, creates it with default values.
   */
  public getConfig(key: string): IConfig | undefined {
    let config = this.configs[key]
    if (!config && this.registry[key]) {
      const newConfig = this.loadConfig(key)
      if (newConfig) {
        config = newConfig
      }
    }
    return config
  }

  /**
   * Saves a config to a serializable format
   * @param key The config key to save
   * @returns Serialized config data or null if config not found
   */
  public saveConfig(key: string): any | null {
    const config = this.configs[key]
    if (!config) {
      console.error(`Cannot save - config not found for key: ${key}`)
      return null
    }
    const serialized = config.save()
    return serialized
  }

  /**
   * Loads multiple config tiers from a composite JSON structure.
   * Expected JSON structure:
   * { pageConfig: { ... }, gameConfigs: [ { ... }, { ... } ] }
   * This method registers the page config under "page" and game configs under keys like "game_0", "game_1", etc.
   */
  public loadAllConfigs(data: any): void {
    if (data.pageConfig) {
      this.loadConfig('page', data.pageConfig)
    }
  }

  /**
   * Gets all configs for a specific casino and game type
   * @param casinoId The ID of the casino
   * @param gameType The type of game (e.g., 'dice', 'slots')
   * @returns Array of configs for all instances of the game type in the casino
   */
  public getCasinoGameConfigs(casinoId: string, gameType: string): IConfig[] {
    const configs: IConfig[] = []
    const pattern = new RegExp(`^${gameType}_${casinoId}_.*$`)

    for (const [key, config] of Object.entries(this.configs)) {
      if (pattern.test(key)) {
        configs.push(config)
      }
    }

    return configs
  }

  /**
   * Creates a new instance of a game config for a casino
   * @param casinoId The ID of the casino
   * @param gameType The type of game
   * @param instanceId The unique identifier for this instance
   * @param initialData Optional initial configuration data
   */
  public createGameInstance(
    casinoId: string,
    gameType: string,
    instanceId: string,
    initialData: any = {}
  ): IConfig | null {
    const configKey = `${gameType}_${casinoId}_${instanceId}`
    return this.loadConfig(configKey, initialData)
  }
}
