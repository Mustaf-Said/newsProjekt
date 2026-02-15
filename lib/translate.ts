import { Translate } from "@google-cloud/translate/build/src/v2";

const apiKey = process.env.GOOGLE_TRANSLATE_KEY;
let translator: Translate | null = null;

function getTranslator(): Translate | null {
  if (!apiKey) {
    return null;
  }
  if (!translator) {
    translator = new Translate({ key: apiKey });
  }
  return translator;
}

export async function translateToSomali(text: string): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) {
    return "";
  }

  const client = getTranslator();
  if (!client) {
    console.error("[translate] Missing GOOGLE_TRANSLATE_KEY");
    return text;
  }

  try {
    const [translated] = await client.translate(trimmed, "so");
    return translated || text;
  } catch (error) {
    console.error("[translate] Translation failed", error);
    return text;
  }
}
