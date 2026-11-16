// Tests de non-régression du moteur de démo (mode interactif existant)
// et du mode capture vidéo ajouté pour Astror Video Studio.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DemoEngine } from '../demo/engine'
import { registerDemoHost } from '../demo/bridge'
import { SCENARIOS } from '../demo/scenarios'

// jsdom n'a pas de mise en page : on simule un élément « visible ».
const offsetParentDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')

function mountDom() {
  document.body.innerHTML = `
    <div class="screen-area"><div class="screen">
      <button data-demo-id="btn-a">A</button>
      <button data-demo-id="btn-b">B</button>
      <input data-demo-id="field" />
    </div></div>
    <button data-demo-id="tab-sky" aria-selected="true">Ciel</button>
    <button data-demo-id="tab-tools" aria-selected="false">Outils</button>`
}

function makeHost() {
  const calls = []
  let tab = 'sky'
  const host = {
    navigate: vi.fn((t) => {
      calls.push(t)
      tab = t.tool ? 'tools' : (t.tab ?? tab)
      document.querySelectorAll('[data-demo-id^="tab-"]').forEach(b =>
        b.setAttribute('aria-selected', String(b.getAttribute('data-demo-id') === `tab-${tab}`)))
    }),
    getTab: () => tab,
  }
  return { host, calls }
}

let unregister = () => {}

beforeEach(() => {
  vi.useFakeTimers()
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', { configurable: true, get() { return document.body } })
  HTMLElement.prototype.scrollIntoView = function () {}
  localStorage.clear()
  mountDom()
})

afterEach(() => {
  unregister()
  vi.useRealTimers()
  if (offsetParentDesc) Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDesc)
  document.body.innerHTML = ''
  delete window.__ASTROR_CAPTURE_EVENTS__
})

const advance = (ms) => vi.advanceTimersByTimeAsync(ms)

describe('DemoEngine — mode interactif (existant)', () => {
  it('exécute navigation, clic et saisie puis affiche « Visite terminée »', async () => {
    const { host, calls } = makeHost()
    unregister = registerDemoHost(host)
    const clicks = []
    document.querySelector('[data-demo-id="btn-a"]').addEventListener('click', () => clicks.push('a'))
    const eng = new DemoEngine({
      name: 't', label: 'Test', steps: [
        { type: 'navigate', to: 'tools', narrate: 'Allons aux outils' },
        { type: 'click', target: 'btn-a', narrate: 'Clic' },
        { type: 'type', target: 'field', text: 'Lune' },
        { type: 'highlight', target: 'btn-b', label: 'B' },
        { type: 'narrate', text: 'Fin', ms: 500 },
      ],
    })
    eng.start()
    expect(document.querySelector('.demo-bar')).not.toBeNull()   // barre de contrôle présente
    await advance(20000)
    expect(calls[0]).toEqual({ tab: 'tools', tool: undefined })
    expect(clicks).toEqual(['a'])
    expect(document.querySelector('[data-demo-id="field"]').value).toBe('Lune')
    expect(document.querySelector('.demo-narration').textContent).toContain('Visite terminée')
    eng.stop()
    expect(document.querySelector('.demo-bar')).toBeNull()
  })

  it('isole puis restaure le localStorage à la sortie', async () => {
    unregister = registerDemoHost(makeHost().host)
    localStorage.setItem('astror_profile_v1', '{"level":"Expert"}')
    localStorage.setItem('astror_journal_v1', '[1]')
    const eng = new DemoEngine({ name: 't', label: 'T', steps: [{ type: 'wait', ms: 100 }] })
    eng.start()
    expect(JSON.parse(localStorage.getItem('astror_profile_v1')).level).toBe('Amateur') // graine
    expect(localStorage.getItem('astror_onboarded_v1')).toBe('1')
    localStorage.setItem('astror_new_key', 'x')        // écriture pendant la démo
    await advance(2000)
    eng.stop()
    expect(localStorage.getItem('astror_profile_v1')).toBe('{"level":"Expert"}')
    expect(localStorage.getItem('astror_journal_v1')).toBe('[1]')
    expect(localStorage.getItem('astror_new_key')).toBeNull()
    expect(localStorage.getItem('astror_onboarded_v1')).toBeNull()
  })

  it('sortie anticipée par Échap : arrêt, overlay retiré, onglet de départ restauré', async () => {
    const { host, calls } = makeHost()
    unregister = registerDemoHost(host)
    const clicks = []
    document.querySelector('[data-demo-id="btn-b"]').addEventListener('click', () => clicks.push('b'))
    const eng = new DemoEngine({ name: 't', label: 'T', steps: [
      { type: 'navigate', to: 'tools' }, { type: 'wait', ms: 5000 }, { type: 'click', target: 'btn-b' },
    ] })
    eng.start()
    await advance(1000)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await advance(10000)
    expect(clicks).toEqual([])
    expect(document.querySelector('.demo-cursor')).toBeNull()
    expect(calls.at(-1)).toEqual({ tab: 'sky' })
  })

  it('reste résilient : un élément introuvable ne bloque pas la visite', async () => {
    unregister = registerDemoHost(makeHost().host)
    const clicks = []
    document.querySelector('[data-demo-id="btn-a"]').addEventListener('click', () => clicks.push('a'))
    const eng = new DemoEngine({ name: 't', label: 'T', steps: [
      { type: 'click', target: 'absent' }, { type: 'click', target: 'btn-a' },
    ] })
    eng.start()
    await advance(20000)
    expect(clicks).toEqual(['a'])
    eng.stop()
  })

  it('les scénarios livrés sont bien formés', () => {
    const allowed = ['navigate', 'click', 'type', 'wait', 'highlight', 'narrate']
    for (const s of Object.values(SCENARIOS)) {
      expect(s.steps.length).toBeGreaterThan(0)
      for (const st of s.steps) expect(allowed).toContain(st.type)
    }
  })
})

describe('DemoEngine — mode capture vidéo', () => {
  function capture(steps, capture = {}, extra = {}) {
    const events = []
    let result = null
    const eng = new DemoEngine({ name: 'cap', label: 'Cap', steps }, {
      mode: 'capture',
      capture: { syncMark: false, stepTimeoutMs: 1000, ...capture },
      onEvent: (e) => events.push(e),
      onFinish: (r) => { result = r },
      ...extra,
    })
    return { eng, events, get result() { return result } }
  }

  it('masque la barre de contrôle et la bulle, émet des événements horodatés ordonnés', async () => {
    unregister = registerDemoHost(makeHost().host)
    const c = capture([
      { type: 'navigate', to: 'tools', narrate: 'Les outils' },
      { type: 'click', target: 'btn-a', narrate: 'Un clic' },
      { type: 'highlight', target: 'btn-b', label: 'B' },
      { type: 'narrate', text: 'Fin' },
    ])
    c.eng.start()
    await advance(20000)
    expect(document.querySelector('.demo-bar').style.display).toBe('none')
    expect(document.querySelector('.demo-narration').style.opacity).toBe('0')
    const types = c.events.map(e => e.type)
    expect(types[0]).toBe('scenario:start')
    expect(types.at(-1)).toBe('scenario:end')
    for (const t of ['step:start', 'step:end', 'navigation:complete', 'cursor:move', 'action:click',
      'highlight:show', 'narration:show', 'narration:hide']) {
      expect(types).toContain(t)
    }
    expect(types.filter(t => t === 'step:start')).toHaveLength(4)
    for (let k = 1; k < c.events.length; k++) expect(c.events[k].t).toBeGreaterThanOrEqual(c.events[k - 1].t)
    expect(c.result).toEqual({ ok: true })
    c.eng.stop()                                                  // l'enregistreur appelle stopDemo()
    expect(c.events.at(-1).type).toBe('narration:hide')
    expect(c.events.map(e => e.type)).toContain('highlight:hide')
    expect(c.result).toEqual({ ok: true })                        // pas de second onFinish
  })

  it('tient chaque étape au moins holdMs à partir de la narration', async () => {
    unregister = registerDemoHost(makeHost().host)
    const c = capture([
      { type: 'narrate', text: 'Phrase courte' },
      { type: 'highlight', target: 'btn-a', narrate: 'Voici A' },
    ], { holdMs: { 0: 4200, 1: 3000 } })
    c.eng.start()
    await advance(20000)
    const show = c.events.filter(e => e.type === 'narration:show')
    const ends = c.events.filter(e => e.type === 'step:end')
    expect(ends[0].t - show[0].t).toBeGreaterThanOrEqual(4200)
    expect(ends[0].t - show[0].t).toBeLessThan(4300)          // pas d'estimation de lecture en plus
    expect(ends[1].t - show[1].t).toBeGreaterThanOrEqual(3000)
  })

  it('élément introuvable : action:error, arrêt, onFinish(ok:false) et store restauré', async () => {
    unregister = registerDemoHost(makeHost().host)
    localStorage.setItem('astror_profile_v1', '{"level":"Expert"}')
    const clicks = []
    document.querySelector('[data-demo-id="btn-a"]').addEventListener('click', () => clicks.push('a'))
    const c = capture([{ type: 'click', target: 'absent' }, { type: 'click', target: 'btn-a' }])
    c.eng.start()
    await advance(20000)
    const err = c.events.find(e => e.type === 'action:error')
    expect(err.data.message).toMatch(/introuvable/)
    expect(err.step).toBe(0)
    expect(clicks).toEqual([])                                    // la suite n'est pas jouée
    expect(c.result.ok).toBe(false)
    expect(c.events.some(e => e.type === 'scenario:end')).toBe(false)
    expect(localStorage.getItem('astror_profile_v1')).toBe('{"level":"Expert"}')
    expect(document.querySelector('.demo-cursor')).toBeNull()
  })

  it('navigation trop lente (écran en chargement) : erreur explicite', async () => {
    unregister = registerDemoHost(makeHost().host)
    document.querySelector('.screen-area').insertAdjacentHTML('beforeend', '<div data-demo-loading></div>')
    const c = capture([{ type: 'navigate', to: 'tools' }])
    c.eng.start()
    await advance(5000)
    expect(c.result.ok).toBe(false)
    expect(c.result.error).toMatch(/Navigation non confirmée/)
  })

  it('hôte React absent : erreur explicite', async () => {
    const c = capture([{ type: 'navigate', to: 'tools' }])
    c.eng.start()
    await advance(2000)
    expect(c.result.error).toMatch(/Hôte de navigation absent/)
  })

  it('mire de synchronisation affichée puis retirée avant scenario:start', async () => {
    unregister = registerDemoHost(makeHost().host)
    const c = capture([{ type: 'wait', ms: 100 }], { syncMark: true })
    c.eng.start()
    await advance(50)
    expect(document.querySelector('.demo-sync-mark')).not.toBeNull()
    await advance(5000)
    expect(document.querySelector('.demo-sync-mark')).toBeNull()
    const types = c.events.map(e => e.type)
    expect(types.indexOf('sync:mark')).toBeLessThan(types.indexOf('scenario:start'))
  })

  it('graine complémentaire appliquée puis retirée', async () => {
    unregister = registerDemoHost(makeHost().host)
    const c = capture([{ type: 'wait', ms: 100 }], {}, { seed: { astror_journal_v1: '[]', other_key: 'x' } })
    c.eng.start()
    expect(localStorage.getItem('astror_journal_v1')).toBe('[]')
    expect(localStorage.getItem('other_key')).toBeNull()          // seules les clés astror_ sont admises
    await advance(3000)
    c.eng.stop()
    expect(localStorage.getItem('astror_journal_v1')).toBeNull()
  })
})

describe('index — activation du mode capture', () => {
  it('exige ?capture=1 ET window.__ASTROR_CAPTURE__', async () => {
    const { getCaptureRequest } = await import('../demo')
    window.__ASTROR_CAPTURE__ = { scenario: { name: 'x', label: 'x', steps: [] } }
    expect(getCaptureRequest()).toBeNull()                        // pas de ?capture=1
    window.history.replaceState(null, '', '/?capture=1')
    expect(getCaptureRequest()?.scenario.name).toBe('x')
    delete window.__ASTROR_CAPTURE__
    expect(getCaptureRequest()).toBeNull()                        // pas d'injection
    window.history.replaceState(null, '', '/')
  })
})
