/**
 * Status Command
 * 
 * Provides information about the current cADR configuration and environment.
 */

import { loadConfig, getDefaultConfigPath } from '../config';
import { loggerInstance as logger } from '../logger';
import { existsSync } from 'fs';

/**
 * Execute the status command
 * Displays configuration and environment status
 */
export async function statusCommand(): Promise<void> {
  try {
    const configPath = getDefaultConfigPath();
    const configExists = existsSync(configPath);

    // eslint-disable-next-line no-console
    console.log('\n🔍 cADR Status');
    // eslint-disable-next-line no-console
    console.log('='.repeat(30));

    // Config Status
    // eslint-disable-next-line no-console
    console.log(`\n📄 Configuration:`);
    if (configExists) {
      // eslint-disable-next-line no-console
      console.log(`   Path: ${configPath}`);
      
      const config = await loadConfig(configPath);
      if (config) {
        // eslint-disable-next-line no-console
        console.log(`   Provider: ${config.provider}`);
        // eslint-disable-next-line no-console
        console.log(`   Model: ${config.analysis_model}`);
        
        // API Key Check
        const apiKeySet = !!process.env[config.api_key_env];
        // eslint-disable-next-line no-console
        console.log(`   API Key (${config.api_key_env}): ${apiKeySet ? '✅ Set' : '❌ Not Set'}`);
      } else {
        // eslint-disable-next-line no-console
        console.log('   ❌ Error loading configuration details.');
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(`   Path: ${configPath} (❌ Not Found)`);
      // eslint-disable-next-line no-console
      console.log('   Run `cadr init` to create one.');
    }

    // Git Status (Basic check)
    // eslint-disable-next-line no-console
    console.log(`\n🛠️ Environment:`);
    // eslint-disable-next-line no-console
    console.log(`   OS: ${process.platform}`);
    // eslint-disable-next-line no-console
    console.log(`   Node: ${process.version}`);
    
    // eslint-disable-next-line no-console
    console.log('\nDone.\n');

    logger.info('Status command completed');
  } catch (error) {
    logger.error('Status command failed', { error });
    // eslint-disable-next-line no-console
    console.error('\n❌ Failed to retrieve status. Check logs for details.\n');
  }
}
