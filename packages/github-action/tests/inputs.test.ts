import { ActionInputsSchema } from '../src/validation';

describe('Action Input Validation', () => {
  it('should validate valid inputs', async () => {
    const inputs = {
      apiKey: 'sk-1234567890',
      provider: 'openai',
      configPath: 'cadr.yaml',
      adrDirectory: 'docs/adr',
      failOnError: false,
    };
    
    await expect(ActionInputsSchema.validate(inputs)).resolves.toEqual({
      ...inputs,
      model: ''
    });
  });

  it('should fail on missing api key', async () => {
    const inputs = {
      provider: 'openai',
    };
    
    await expect(ActionInputsSchema.validate(inputs)).rejects.toThrow('apiKey is required');
  });

  it('should fail on invalid provider', async () => {
    const inputs = {
      apiKey: 'sk-1234567890',
      provider: 'invalid-provider',
    };
    
    await expect(ActionInputsSchema.validate(inputs)).rejects.toThrow('provider must be "openai" or "gemini"');
  });

  it('should provide defaults', async () => {
    const inputs = {
      apiKey: 'sk-1234567890',
    };
    
    const result = await ActionInputsSchema.validate(inputs);
    expect(result.provider).toBe('openai');
    expect(result.configPath).toBe('cadr.yaml');
    expect(result.failOnError).toBe(false);
  });
});
