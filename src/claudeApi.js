const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

export function getApiKey() {
  try { return localStorage.getItem('astror_api_key_v1') || '' } catch { return '' }
}

export function saveApiKey(key) {
  try { localStorage.setItem('astror_api_key_v1', key.trim()) } catch {}
}

export async function callClaude(messages, apiKey) {
  const key = apiKey ?? getApiKey()

  if (!key && window.claude?.complete) {
    return window.claude.complete({ messages })
  }
  if (!key) throw new Error('no-key')

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.type || String(res.status))
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export async function testApiKey(key) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Réponds juste: OK' }],
    }),
  })
  if (!res.ok) throw new Error(String(res.status))
  return true
}
