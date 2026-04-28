import { NextRequest, NextResponse } from 'next/server'

const DEEPL_KEY = process.env.DEEPL_API_KEY || ''
const DEEPL_BASE = DEEPL_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com'
  : 'https://api.deepl.com'

export async function POST(req: NextRequest) {
  try {
    const { text, target_lang = 'ID' } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    // If no DeepL key, fallback to MyMemory (free, no key needed)
    if (!DEEPL_KEY) {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|id`
      )
      const data = await res.json()
      return NextResponse.json({
        translated: data.responseData?.translatedText || text,
        engine: 'mymemory',
      })
    }

    // DeepL translation
    const res = await fetch(`${DEEPL_BASE}/v2/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang,
        source_lang: 'EN',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('DeepL error:', res.status, errText)
      // Fallback to MyMemory on DeepL error
      const fallback = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|id`
      )
      const fbData = await fallback.json()
      return NextResponse.json({
        translated: fbData.responseData?.translatedText || text,
        engine: 'mymemory-fallback',
      })
    }

    const data = await res.json()
    const translated = data.translations?.[0]?.text || text

    return NextResponse.json({ translated, engine: 'deepl' })
  } catch (e: any) {
    console.error('Translation API error:', e)
    return NextResponse.json({ error: e.message || 'Translation failed' }, { status: 500 })
  }
}
