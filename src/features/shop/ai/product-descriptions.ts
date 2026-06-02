import 'server-only';

import { unstable_cache } from 'next/cache';
import { getGeminiClient, getGeminiModel, isGeminiConfigured } from '@/lib/gemini';

export type ProductDescriptionInput = {
  name: string;
  category: string;
  careLabel: string;
  tags: string[];
  imageAlt?: string;
};

export async function generateProductDescription(
  product: ProductDescriptionInput,
) {
  if (!isGeminiConfigured()) {
    return fallbackProductDescription(product);
  }

  const generatedDescription = await getCachedProductDescription(product);

  return generatedDescription ?? fallbackProductDescription(product);
}

const getCachedProductDescription = unstable_cache(
  async (product: ProductDescriptionInput) =>
    tryGenerateProductDescription(product),
  ['bonzai-product-ai-description'],
  {
    revalidate: 60 * 60 * 24,
    tags: ['product-ai-descriptions'],
  },
);

function fallbackProductDescription({
  name,
  category,
  careLabel,
}: ProductDescriptionInput) {
  return `${name} is a considered ${category.toLowerCase()} piece selected for calm interiors, pairing a ${careLabel.toLowerCase()} care profile with Bonzai's quiet editorial sensibility.`;
}

async function tryGenerateProductDescription(product: ProductDescriptionInput) {
  const ai = getGeminiClient();

  if (!ai) {
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: buildProductDescriptionPrompt(product),
    });

    return cleanGeneratedDescription(response.text);
  } catch {
    return null;
  }
}

function buildProductDescriptionPrompt({
  name,
  category,
  careLabel,
  tags,
  imageAlt,
}: ProductDescriptionInput) {
  return `Write one concise English product description for Bonzai, a premium plant and plant-accessory marketplace.

Voice: high-end editorial, calm, spacious, plant-focused, and premium.
Length: one sentence, 18 to 32 words.
Avoid: markdown, quotation marks, hard-sell language, emojis, price mentions, invented origin stories, and care claims beyond the provided attributes.

Product attributes:
- Name: ${name}
- Category: ${category}
- Care profile: ${careLabel}
- Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}
- Image note: ${imageAlt || 'Not provided'}

Return only the description.`;
}

function cleanGeneratedDescription(description: string | undefined) {
  const cleanDescription = description
    ?.replace(/^```(?:text)?\s*/i, '')
    .replace(/```$/i, '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanDescription || null;
}
