import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface GenerateEmailsParams {
  leadFirstName: string;
  leadLastName: string;
  leadEmail: string;
  leadCompany: string;
  leadTitle: string;
  leadLinkedinUrl?: string | null;
  campaignTargetDescription: string;
}

interface EmailVariant {
  subject: string;
  body: string;
}

export async function generateEmailVariants(
  params: GenerateEmailsParams
): Promise<EmailVariant[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert cold email copywriter. Respond with valid JSON only — no markdown, no explanation.",
      },
      {
        role: "user",
        content: `Generate 3 distinct, hyper-personalized cold email variants for this lead.

Lead Information:
- Name: ${params.leadFirstName} ${params.leadLastName}
- Title: ${params.leadTitle}
- Company: ${params.leadCompany}
- Email: ${params.leadEmail}
${params.leadLinkedinUrl ? `- LinkedIn: ${params.leadLinkedinUrl}` : ""}

Campaign Target: ${params.campaignTargetDescription}

Requirements:
- Each email under 150 words
- Use the lead's name and company naturally
- Focus on value, not features
- End with a clear, low-friction CTA
- Vary tone/angle across the 3 variants

Respond with this exact JSON object:
{ "variants": [
  { "subject": "...", "body": "..." },
  { "subject": "...", "body": "..." },
  { "subject": "...", "body": "..." }
] }`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  // Handle { "variants": [...] } or any other top-level key wrapping an array
  if (Array.isArray(parsed)) return parsed as EmailVariant[];
  const firstArray = Object.values(parsed).find(Array.isArray);
  if (firstArray) return firstArray as EmailVariant[];
  return [] as EmailVariant[];
}
