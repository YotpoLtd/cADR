import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { loadConfig, validateConfig } from '../../packages/cli/src/config';

describe('Configuration Integration', () => {
  const testConfigPath = '/tmp/test-cadr.yaml';
  
  afterEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  test('creates and loads valid configuration', async () => {
    // Create a valid config file
    const validConfig = {
      provider: 'openai',
      analysis_model: 'gpt-4',
      api_key_env: 'OPENAI_API_KEY',
      timeout_seconds: 15
    };
    
    fs.writeFileSync(testConfigPath, yaml.dump(validConfig));
    
    // Load the config
    const loadedConfig = await loadConfig(testConfigPath);
    
    expect(loadedConfig).toEqual(validConfig);
    expect(validateConfig(loadedConfig).valid).toBe(true);
  });

  test('handles malformed YAML gracefully', async () => {
    // Create invalid YAML
    fs.writeFileSync(testConfigPath, 'provider: openai\n  invalid: indentation');
    
    const loadedConfig = await loadConfig(testConfigPath);
    
    expect(loadedConfig).toBeNull();
  });

  test('validates configuration schema correctly', () => {
    const validConfig = {
      provider: 'openai',
      analysis_model: 'gpt-4',
      api_key_env: 'OPENAI_API_KEY',
      timeout_seconds: 15
    };
    
    const result = validateConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects invalid configuration', () => {
    const invalidConfig = {
      provider: 'invalid-provider',
      analysis_model: 'gpt-4',
      api_key_env: 'OPENAI_API_KEY',
      timeout_seconds: 15
    };
    
    const result = validateConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('provider must be one of the following values: openai');
  });

  test('handles missing configuration file', async () => {
    const nonExistentPath = '/tmp/non-existent-cadr.yaml';
    
    const loadedConfig = await loadConfig(nonExistentPath);
    
    expect(loadedConfig).toBeNull();
  });
});
