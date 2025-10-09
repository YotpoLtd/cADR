import * as yaml from 'js-yaml';
import * as yup from 'yup';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as readline from 'readline';
import { loggerInstance as logger } from './logger';

/**
 * Configuration schema for LLM analysis
 */
export interface AnalysisConfig {
  provider: 'openai';
  analysis_model: string;
  api_key_env: string;
  timeout_seconds: number;
  ignore_patterns?: string[];
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Yup validation schema for configuration
 */
const configSchema = yup.object({
  provider: yup.string().oneOf(['openai']).required('Provider must be "openai"'),
  analysis_model: yup.string().required('Analysis model is required'),
  api_key_env: yup.string().required('API key environment variable name is required'),
  timeout_seconds: yup
    .number()
    .min(1, 'timeout_seconds must be at least 1 second')
    .max(60, 'timeout_seconds must not exceed 60 seconds')
    .required('timeout_seconds is required'),
  ignore_patterns: yup.array().of(yup.string()).optional(),
});

/**
 * Load and validate configuration from YAML file
 * @param configPath - Path to configuration file
 * @returns Promise resolving to validated config or null on error
 */
export async function loadConfig(configPath: string): Promise<AnalysisConfig | null> {
  try {
    // Check if config file exists
    if (!existsSync(configPath)) {
      logger.warn('Configuration file not found', { configPath });
      return null;
    }

    // Read and parse YAML
    const fileContent = readFileSync(configPath, 'utf-8');
    const parsedConfig = yaml.load(fileContent);

    if (!parsedConfig || typeof parsedConfig !== 'object') {
      logger.error('Invalid YAML configuration', { configPath });
      return null;
    }

    // Validate configuration
    const validationResult = validateConfig(parsedConfig);
    if (!validationResult.valid) {
      logger.error('Configuration validation failed', {
        configPath,
        errors: validationResult.errors,
      });
      return null;
    }

    const config = parsedConfig as AnalysisConfig;

    // Warn if API key environment variable is not set
    if (!process.env[config.api_key_env]) {
      logger.warn('API key environment variable is not set', {
        api_key_env: config.api_key_env,
      });
    }

    logger.info('Configuration loaded successfully', { configPath, provider: config.provider });
    return config;
  } catch (error) {
    logger.error('Failed to load configuration', { error, configPath });
    return null;
  }
}

/**
 * Validate configuration object against schema
 * @param config - Configuration object to validate
 * @returns Validation result with errors if any
 */
export function validateConfig(config: unknown): ConfigValidationResult {
  try {
    configSchema.validateSync(config, { abortEarly: false });
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        valid: false,
        errors: error.errors,
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Prompt user for input with default value
 */
function prompt(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(promptText, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

/**
 * Create configuration interactively
 * @param configPath - Path where config should be created
 * @returns Promise resolving to created config or null on error
 */
export async function createConfig(configPath: string): Promise<AnalysisConfig | null> {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // eslint-disable-next-line no-console
    console.log('\n🔧 cADR Configuration Setup\n');

    // Prompt for configuration values
    const provider = await prompt(rl, 'LLM Provider', 'openai');
    const analysis_model = await prompt(rl, 'Analysis Model', 'gpt-4');
    const api_key_env = await prompt(rl, 'API Key Environment Variable', 'OPENAI_API_KEY');
    const timeoutInput = await prompt(rl, 'Timeout (seconds)', '15');
    const timeout_seconds = parseInt(timeoutInput, 10) || 15;

    const ignorePatternsInput = await prompt(
      rl,
      'Ignore Patterns (comma-separated, optional)',
      '*.md,package-lock.json'
    );
    const ignore_patterns =
      ignorePatternsInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0) || undefined;

    rl.close();

    // Build configuration object
    const config: AnalysisConfig = {
      provider: provider as 'openai',
      analysis_model,
      api_key_env,
      timeout_seconds,
      ...(ignore_patterns && ignore_patterns.length > 0 ? { ignore_patterns } : {}),
    };

    // Validate configuration
    const validationResult = validateConfig(config);
    if (!validationResult.valid) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Configuration validation failed:');
      // eslint-disable-next-line no-console
      validationResult.errors.forEach((error) => console.error(`  - ${error}`));
      return null;
    }

    // Convert to YAML
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    // Write to file
    writeFileSync(configPath, yamlContent, 'utf-8');

    logger.info('Configuration file created successfully', { configPath });
    // eslint-disable-next-line no-console
    console.log(`\n✅ Configuration saved to: ${configPath}\n`);

    return config;
  } catch (error) {
    logger.error('Failed to create configuration', { error, configPath });
    return null;
  }
}

/**
 * Get default configuration file path
 */
export function getDefaultConfigPath(): string {
  return 'cadr.yaml';
}

