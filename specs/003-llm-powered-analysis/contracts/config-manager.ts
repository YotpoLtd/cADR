/**
 * Configuration Manager Contract
 * 
 * Defines the interface for YAML configuration management.
 * Implemented by config module in @cadr/core/src/config.ts
 */

export interface ConfigManager {
  /**
   * Load and validate configuration from cadr.yaml
   * @param configPath - Path to configuration file
   * @returns Promise resolving to validated config or null on error
   */
  loadConfig(configPath: string): Promise<AnalysisConfig | null>;

  /**
   * Create initial configuration interactively
   * @param configPath - Path where config should be created
   * @returns Promise resolving to created config or null on error
   */
  createConfig(configPath: string): Promise<AnalysisConfig | null>;

  /**
   * Validate configuration object
   * @param config - Configuration object to validate
   * @returns Validation result with errors if any
   */
  validateConfig(config: unknown): ConfigValidationResult;
}

export interface AnalysisConfig {
  provider: "openai";
  analysis_model: string;
  api_key_env: string;
  timeout_seconds: number;
  ignore_patterns?: string[];
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interactive prompt responses for config creation
 */
export interface ConfigPrompts {
  provider: () => Promise<string>;
  model: () => Promise<string>;
  apiKeyEnv: () => Promise<string>;
  timeout: () => Promise<number>;
  ignorePatterns: () => Promise<string[]>;
}

/**
 * Configuration file operations
 */
export interface ConfigFileOperations {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  validateYaml(content: string): Promise<boolean>;
}
