const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const OR_URL = 'https://openrouter.ai/api/v1'

// ── Anthropic ──────────────────────────────────────────────────────────────

export function getApiKey() {
  try { return localStorage.getItem('astror_api_key_v1') || '' } catch { return '' }
}
export function saveApiKey(key) {
  try { localStorage.setItem('astror_api_key_v1', key.trim()) } catch {}
}

export async function callClaude(messages, apiKey) {
  const key = apiKey ?? getApiKey()
  if (!key) throw new Error('no-key')
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1024, messages }),
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
      model: ANTHROPIC_MODEL, max_tokens: 10,
      messages: [{ role: 'user', content: 'Réponds juste: OK' }],
    }),
  })
  if (!res.ok) throw new Error(String(res.status))
  return true
}

// ── OpenRouter ─────────────────────────────────────────────────────────────

export function getOpenRouterKey() {
  try { return localStorage.getItem('astror_or_key_v1') || '' } catch { return '' }
}
export function saveOpenRouterKey(key) {
  try { localStorage.setItem('astror_or_key_v1', key.trim()) } catch {}
}
export function getSelectedModel() {
  try { return localStorage.getItem('astror_or_model_v1') || '' } catch { return '' }
}
export function saveSelectedModel(modelId) {
  try { localStorage.setItem('astror_or_model_v1', modelId) } catch {}
}

export async function fetchFreeModels(apiKey) {
  const res = await fetch(`${OR_URL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(String(res.status))
  const { data } = await res.json()
  return data
    .filter(m => m.id.endsWith(':free'))
    .map(m => ({
      id: m.id,
      name: m.name || m.id,
      context: m.context_length || 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function callOpenRouter(messages, apiKey, modelId) {
  const res = await fetch(`${OR_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://astror.app',
      'X-Title': 'Astror',
    },
    body: JSON.stringify({ model: modelId, messages, max_tokens: 1024 }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || String(res.status))
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Unified ────────────────────────────────────────────────────────────────
// Priorité : OpenRouter (si clé + modèle) → Anthropic → window.claude → erreur

export async function callAI(messages) {
  const orKey = getOpenRouterKey()
  const orModel = getSelectedModel()
  if (orKey && orModel) return callOpenRouter(messages, orKey, orModel)

  const anKey = getApiKey()
  if (anKey) return callClaude(messages, anKey)

  if (window.claude?.complete) return window.claude.complete({ messages })

  throw new Error('no-key')
}
