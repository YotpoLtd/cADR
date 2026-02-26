import { loggerInstance as logger } from '../logger';

export interface ParsedAnalysisResponse {
  is_significant: boolean;
  reason: string;
  confidence?: number;
}

function validateAnalysisResponse(parsed: unknown): ParsedAnalysisResponse {
  const p = parsed as Record<string, unknown>;
  if (typeof p?.is_significant !== 'boolean' || typeof p?.reason !== 'string') {
    throw new Error(
      `Invalid response format. Expected {is_significant: boolean, reason: string}, got: ${JSON.stringify(parsed).substring(0, 150)}...`
    );
  }
  if (p.is_significant && !p.reason) {
    throw new Error('LLM indicated significant change but provided no reason');
  }
  const result: ParsedAnalysisResponse = {
    is_significant: p.is_significant,
    reason: p.reason,
  };
  if (typeof p.confidence === 'number' && p.confidence >= 0 && p.confidence <= 1) {
    result.confidence = p.confidence;
  }
  return result;
}

export function parseAnalysisResponse(responseContent: string): ParsedAnalysisResponse {
  return parseLLMResponse(responseContent, validateAnalysisResponse);
}

export function parseMarkdownContent(content: string): { content: string; title: string } {
  let cleanedContent = content.trim();

  const codeBlockMatch = cleanedContent.match(/```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    cleanedContent = codeBlockMatch[1].trim();
  }

  const titleMatch = cleanedContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Decision';
  return { content: cleanedContent, title };
}

export function extractTitleFromMarkdown(content: string): string {
  return parseMarkdownContent(content).title;
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
