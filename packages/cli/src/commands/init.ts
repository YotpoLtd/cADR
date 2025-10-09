/**
 * Init Command
 * 
 * Interactive command to create cadr.yaml configuration file.
 * Handles user prompts and configuration creation.
 */

import { createConfig, getDefaultConfigPath, validateConfig } from '../config';
import { loggerInstance as logger } from '../logger';
import { existsSync } from 'fs';

/**
 * Execute the init command
 * Creates configuration file interactively
 */
export async function initCommand(): Promise<void> {
  try {
    const configPath = getDefaultConfigPath();

    // Check if config already exists
    if (existsSync(configPath)) {
      // eslint-disable-next-line no-console
      console.log(`\nℹ️  Configuration file already exists: ${configPath}`);
      // eslint-disable-next-line no-console
      console.log('💡 To reconfigure, delete the file and run `cadr init` again.\n');
      return;
    }

    // Create configuration interactively
    const config = await createConfig(configPath);

    if (!config) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Failed to create configuration');
      // eslint-disable-next-line no-console
      console.error('Please try again or check file permissions.\n');
      return;
    }

    // Validate the created config
    const validation = validateConfig(config);
    if (!validation.valid) {
      logger.warn('Created config has validation warnings', {
        errors: validation.errors,
      });
    }

    // Display next steps
    // eslint-disable-next-line no-console
    console.log('📋 Configuration Summary:');
    // eslint-disable-next-line no-console
    console.log(`   Provider: ${config.provider}`);
    // eslint-disable-next-line no-console
    console.log(`   Model: ${config.analysis_model}`);
    // eslint-disable-next-line no-console
    console.log(`   API Key Env: ${config.api_key_env}`);
    // eslint-disable-next-line no-console
    console.log(`   Timeout: ${config.timeout_seconds}s`);
    if (config.ignore_patterns && config.ignore_patterns.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`   Ignore Patterns: ${config.ignore_patterns.join(', ')}`);
    }

    // Check if API key is set
    if (!process.env[config.api_key_env]) {
      // eslint-disable-next-line no-console
      console.warn(`\n⚠️  Warning: ${config.api_key_env} is not set in your environment`);
      // eslint-disable-next-line no-console
      console.warn('Set it before using analysis:');
      // eslint-disable-next-line no-console
      console.warn(`   export ${config.api_key_env}="your-api-key-here"`);
      // eslint-disable-next-line no-console
      const providerLink = config.provider === 'gemini'
        ? 'https://aistudio.google.com/app/apikey'
        : 'https://platform.openai.com/api-keys';
      // eslint-disable-next-line no-console
      console.warn(`\n   Get your API key from: ${providerLink}`);
    }

    // eslint-disable-next-line no-console
    console.log('\n🎉 Ready to analyze!');
    // eslint-disable-next-line no-console
    console.log('Next steps:');
    // eslint-disable-next-line no-console
    console.log('   1. Stage your changes: git add <files>');
    // eslint-disable-next-line no-console
    console.log('   2. Run analysis: cadr --analyze\n');

    logger.info('Init command completed successfully');
  } catch (error) {
    // Fail-open: log error but don't throw
    logger.error('Init command failed', { error });
    // eslint-disable-next-line no-console
    console.error('\n❌ An unexpected error occurred during initialization');
    // eslint-disable-next-line no-console
    console.error('Please check the logs for more details.\n');
  }
}

