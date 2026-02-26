import { loggerInstance as logger } from '../logger';

export interface ParsedAnalysisResponse {
  is_significant: boolean;
  reason: string;
  confidence?: number;
}

export function parseAnalysisResponse(responseContent: string): ParsedAnalysisResponse {
  let jsonContent = responseContent.trim();

  const codeBlockMatch = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonContent = codeBlockMatch[1].trim();
  }

  const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }

  const parsedResponse = JSON.parse(jsonContent);

  if (
    typeof parsedResponse.is_significant !== 'boolean' ||
    typeof parsedResponse.reason !== 'string'
  ) {
    throw new Error(
      `Invalid response format. Expected {is_significant: boolean, reason: string}, got: ${JSON.stringify(parsedResponse).substring(0, 150)}...`
    );
  }

  if (parsedResponse.is_significant && !parsedResponse.reason) {
    throw new Error('LLM indicated significant change but provided no reason');
  }

  const result: ParsedAnalysisResponse = {
    is_significant: parsedResponse.is_significant,
    reason: parsedResponse.reason,
  };

  if (
    typeof parsedResponse.confidence === 'number' &&
    parsedResponse.confidence >= 0 &&
    parsedResponse.confidence <= 1
  ) {
    result.confidence = parsedResponse.confidence;
  }

  return result;
}

export function extractTitleFromMarkdown(content: string): string {
  let cleanedContent = content.trim();

  const codeBlockMatch = cleanedContent.match(/```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    cleanedContent = codeBlockMatch[1].trim();
  }

  const titleMatch = cleanedContent.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled Decision';
}

export function parseLLMResponse<T>(responseContent: string, validator: (parsed: unknown) => T): T {
  try {
    let jsonContent = responseContent.trim();

    const codeBlockMatch = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
    }

    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonContent);
    return validator(parsed);
  } catch (parseError) {
    logger.warn('Failed to parse LLM response as JSON', {
      error: parseError,
      response: responseContent,
    });
    throw new Error(
      `Failed to parse LLM response as JSON. Response was:\n${responseContent.substring(0, 200)}...`
    );
  }
}
