import * as yup from 'yup';

export const ActionInputsSchema = yup.object({
  apiKey: yup.string()
    .required('apiKey is required')
    .min(10, 'apiKey appears too short'),
  
  provider: yup.string()
    .oneOf(['openai', 'gemini'], 'provider must be "openai" or "gemini"')
    .default('openai'),
  
  model: yup.string()
    .optional()
    .default(''),
  
  configPath: yup.string()
    .default('cadr.yaml'),
  
  adrDirectory: yup.string()
    .default('docs/adr'),
  
  failOnError: yup.boolean()
    .default(false)
});
