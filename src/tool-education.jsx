import { useState } from 'react'
import { IcTrophy, IcFlame, IcCheckCircle, IcClose, IcPlay } from './icons'
import { Sheet } from './ui'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'

const QUIZ = [
  { q: 'Quelle planète possède le système d\'anneaux le plus visible ?', opts: ['Jupiter', 'Saturne', 'Uranus', 'Neptune'], a: 1,
    why: 'Les anneaux de Saturne, faits de glace, sont visibles dès une lunette de 60 mm.' },
  { q: 'Que mesure l\'échelle de Bortle ?', opts: ['La magnitude des étoiles', 'La pollution lumineuse', 'La distance des galaxies', 'La phase lunaire'], a: 1,
    why: 'L\'échelle de Bortle (1 à 9) quantifie la noirceur du ciel, de 1 (parfait) à 9 (centre-ville).' },
  { q: 'À quelle distance se trouve la galaxie d\'Andromède (M31) ?', opts: ['2 500 al', '2,5 millions d\'al', '250 000 al', '25 millions d\'al'], a: 1,
    why: 'M31 est à 2,5 millions d\'années-lumière — l\'objet le plus lointain visible à l\'œil nu.' },
  { q: 'Qu\'est-ce que le « seeing » en astronomie ?', opts: ['La transparence du ciel', 'La turbulence atmosphérique', 'La pollution lumineuse', 'L\'humidité'], a: 1,
    why: 'Le seeing mesure la turbulence de l\'air, qui fait scintiller et brouiller les images.' },
]

const PARCOURS = [
  { name: 'Premiers pas sous les étoiles', steps: '8 leçons', pct: 100, done: true },
  { name: 'Lire une carte du ciel', steps: '6 leçons', pct: 66 },
  { name: 'Choisir et régler son télescope', steps: '10 leçons', pct: 30 },
  { name: 'Initiation à l\'astrophoto', steps: '12 leçons', pct: 0 },
]

const EDU_CONTENT = [
  { cat: 'Histoire', title: 'De Galilée au télescope spatial', read: '6 min', body: 'En 1609, Galilée pointe une lunette vers le ciel et découvre les cratères de la Lune, les phases de Vénus et les quatre lunes de Jupiter. Quatre siècles plus tard, le James Webb observe les premières galaxies de l\'univers. Cette page retrace les grandes étapes instrumentales qui ont transformé notre regard sur le cosmos.' },
  { cat: 'Cosmologie', title: 'Le Big Bang en cinq idées', read: '7 min', body: 'L\'univers est en expansion depuis 13,8 milliards d\'années à partir d\'un état chaud et dense. Trois piliers le confirment : la fuite des galaxies, le fond diffus cosmologique à 2,7 K, et l\'abondance des éléments légers forgés dans les premières minutes.' },
  { cat: 'Astrophysique', title: 'Comment naissent les étoiles', read: '5 min', body: 'Dans les nuages moléculaires froids, la gravité effondre des grumeaux de gaz jusqu\'à allumer la fusion de l\'hydrogène. Une étoile naît, équilibre entre gravité et pression de radiation, pour des millions à des milliards d\'années.' },
  { cat: 'Découvertes', title: 'La tension de Hubble', read: '6 min', body: 'Deux méthodes de mesure de l\'expansion de l\'univers donnent des valeurs incompatibles : 67,4 contre 73 km/s/Mpc. Cet écart de plus de 5σ est l\'un des plus grands mystères de la cosmologie actuelle — erreur systématique ou physique nouvelle ?' },
]

function Quiz() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const cur = QUIZ[i]

  const choose = (idx) => { if (picked != null) return; setPicked(idx); if (idx === cur.a) setScore(s => s + 1) }
  const nextQ = () => { if (i + 1 >= QUIZ.length) { setDone(true); return; } setI(i + 1); setPicked(null) }
  const restart = () => { setI(0); setPicked(null); setScore(0); setDone(false) }

  if (done) {
    return (
      <div style={{ padding: 20, borderRadius: 18, textAlign: 'center', background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))', border: '1px solid var(--gold-line)' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#1a130a', background: 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}><IcTrophy size={28} /></span>
        <div className="h-sec" style={{ fontSize: 22 }}>{score} / {QUIZ.length}</div>
        <div className="body" style={{ fontSize: 13.5, margin: '8px 0 18px' }}>
          {score === QUIZ.length ? 'Sans faute, bravo !' : score >= QUIZ.length / 2 ? 'Beau score, continuez à explorer.' : 'Le ciel n\'attend que vous — réessayez !'}
        </div>
        <button className="btn-primary" onClick={restart}><IcPlay size={17} /> Rejouer</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 18, borderRadius: 18, background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="eyebrow">Question {i + 1} / {QUIZ.length}</span>
        <span className="data" style={{ fontSize: 12, color: 'var(--gold)' }}>{score} pt</span>
      </div>
      <div className="h-card" style={{ fontSize: 16, lineHeight: 1.3, marginBottom: 16, fontFamily: 'var(--serif)' }}>{cur.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {cur.opts.map((o, idx) => {
          const isA = idx === cur.a, isP = idx === picked
          let bd = 'var(--line-2)', bg = 'var(--surface-1)', cl = 'var(--text)'
          if (picked != null) {
            if (isA) { bd = 'rgba(132,211,169,.5)'; bg = 'rgba(132,211,169,.1)'; cl = 'var(--good)' }
            else if (isP) { bd = 'rgba(226,141,126,.5)'; bg = 'rgba(226,141,126,.1)'; cl = 'var(--bad)' }
          }
          return (
            <button key={idx} onClick={() => choose(idx)} className="press" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11,
              padding: '13px 14px', borderRadius: 12, cursor: picked == null ? 'pointer' : 'default',
              background: bg, border: '1px solid ' + bd, color: cl, fontSize: 14, fontWeight: 500, fontFamily: 'var(--sans)' }}>
              <span style={{ flex: 1 }}>{o}</span>
              {picked != null && isA && <IcCheckCircle size={18} />}
              {picked != null && isP && !isA && <IcClose size={16} />}
            </button>
          )
        })}
      </div>
      {picked != null && (
        <div style={{ marginTop: 14 }}>
          <div className="body tight serif-body" style={{ fontSize: 13, padding: '11px 13px', borderRadius: 11, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>{cur.why}</div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={nextQ}>{i + 1 >= QUIZ.length ? 'Voir le score' : 'Question suivante'}</button>
        </div>
      )}
    </div>
  )
}

export default function EducationPage({ onBack }) {
  const [seg, setSeg] = useState('learn')
  const [read, setRead] = useState(null)

  return (
    <ToolPage title="Apprendre" onBack={onBack}>
      <ToolSeg items={[{ key: 'learn', label: 'Apprentissage' }, { key: 'content', label: 'Contenus' }]} value={seg} onChange={setSeg} />

      {seg === 'learn' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 14 }}>
            <div style={{ display: 'flex', gap: 13, alignItems: 'center', padding: 15, borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))', border: '1px solid var(--gold-line)' }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#1a130a', background: 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}><IcFlame size={22} /></span>
              <div style={{ flex: 1 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Défi du jour</div>
                <div className="h-card" style={{ fontSize: 14.5 }}>Repérer le Triangle d'été</div>
              </div>
              <span className="data" style={{ fontSize: 12, color: 'var(--gold)' }}>+50 pt</span>
            </div>
          </div>

          <ToolSection title="Quiz éclair">
            <Quiz />
          </ToolSection>

          <ToolSection title="Parcours pédagogiques">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {PARCOURS.map(p => (
                <div key={p.name} style={{ padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <span className="h-card" style={{ fontSize: 14, flex: 1 }}>{p.name}</span>
                    {p.done ? <IcCheckCircle size={18} style={{ color: 'var(--good)' }} /> : <span className="meta" style={{ color: 'var(--gold)' }}>{p.pct}%</span>}
                  </div>
                  <div className="bar"><i style={{ width: p.pct + '%' }} /></div>
                  <div className="meta" style={{ marginTop: 7 }}>{p.steps}</div>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'content' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {EDU_CONTENT.map((c, i) => (
            <button key={i} onClick={() => setRead(c)} className="press" style={{ textAlign: 'left',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
              borderRadius: 16, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="tag">{c.cat}</span>
                <span style={{ flex: 1 }} />
                <span className="meta">{c.read} de lecture</span>
              </div>
              <div className="h-card" style={{ fontSize: 16, fontFamily: 'var(--serif)', marginBottom: 5 }}>{c.title}</div>
              <div className="body tight" style={{ fontSize: 12.5 }}>{c.body.slice(0, 96)}…</div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!read} onClose={() => setRead(null)}>
        {read && (
          <div>
            <div className="tag" style={{ marginBottom: 12 }}>{read.cat}</div>
            <div className="h-sec" style={{ fontSize: 24, marginBottom: 8, lineHeight: 1.15 }}>{read.title}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 16 }}>{read.read} de lecture</div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62 }}>{read.body}</p>
          </div>
        )}
      </Sheet>
    </ToolPage>
  )
}
