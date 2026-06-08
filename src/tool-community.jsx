import { useState } from 'react'
import { IcTrophy, IcStar, IcSpark, IcUsers, IcPin } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'

const COM_POSTS = [
  { user: 'Camille N.', init: 'CN', when: 'il y a 2 h', obj: 'M51 — Galaxie du Tourbillon', gear: 'Newton 200/1000', likes: 142, comments: 18, top: true, label: 'photo · M51' },
  { user: 'Théo R.', init: 'TR', when: 'il y a 5 h', obj: 'Lune gibbeuse au terminateur', gear: 'Mak 127', likes: 89, comments: 7, label: 'photo · Lune' },
  { user: 'Awa D.', init: 'AD', when: 'hier', obj: 'Nébuleuse de l\'Amérique du Nord', gear: 'Lunette 80ED', likes: 207, comments: 24, top: true, label: 'photo · NGC 7000' },
]

const COM_RANK = [
  { rank: 1, user: 'Awa D.', title: 'NGC 7000', votes: 207 },
  { rank: 2, user: 'Camille N.', title: 'M51', votes: 142 },
  { rank: 3, user: 'Léo B.', title: 'Voie Lactée — Cévennes', votes: 118 },
]

const COM_EVENTS = [
  { title: 'Nuit des étoiles', place: 'Observatoire de Meudon', date: '8 août 2026', going: 142, tag: 'Soirée' },
  { title: 'Club d\'astronomie de Paris', place: 'Réunion mensuelle · 19 h', date: 'Tous les 2ᵉ mardis', going: 38, tag: 'Club' },
  { title: 'Star party des Cévennes', place: 'Mont Aigoual · Bortle 2', date: '14–16 août 2026', going: 96, tag: 'Sortie' },
  { title: 'Initiation au télescope', place: 'Parc de la Villette', date: '21 juin 2026', going: 54, tag: 'Atelier' },
]

export default function CommunityPage({ onBack }) {
  const [seg, setSeg] = useState('feed')
  const [likes, setLikes] = useState({})
  const toggleLike = (i) => setLikes(l => ({ ...l, [i]: !l[i] }))

  return (
    <ToolPage title="Communauté" onBack={onBack}>
      <ToolSeg items={[{ key: 'feed', label: 'Fil' }, { key: 'rank', label: 'Classement' }, { key: 'events', label: 'Sorties' }]} value={seg} onChange={setSeg} />

      {seg === 'feed' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {COM_POSTS.map((p, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px' }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--gold)',
                  background: 'radial-gradient(circle at 35% 30%, #1c2950, #0d1326)', border: '1px solid var(--gold-line)' }}>{p.init}</span>
                <div style={{ flex: 1 }}>
                  <div className="h-card" style={{ fontSize: 14 }}>{p.user}</div>
                  <div className="meta" style={{ marginTop: 1 }}>{p.when} · {p.gear}</div>
                </div>
                {p.top && <span className="tag"><IcTrophy size={11} /> Top</span>}
              </div>
              <div className="ph" style={{ height: 168, borderLeft: 0, borderRight: 0, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="meta" style={{ fontSize: 10, color: 'var(--faint)' }}>{p.label}</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div className="h-card" style={{ fontSize: 14, marginBottom: 10, fontFamily: 'var(--serif)' }}>{p.obj}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <button onClick={() => toggleLike(i)} className="press" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer',
                    color: likes[i] ? 'var(--gold)' : 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                    <IcStar size={16} /> {p.likes + (likes[i] ? 1 : 0)}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                    <IcSpark size={15} /> {p.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {seg === 'rank' && (
        <div className="enter">
          <ToolSection title="Photos du mois" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COM_RANK.map(r => (
                <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14,
                  background: r.rank === 1 ? 'linear-gradient(180deg, rgba(217,179,108,.12), var(--surface-1))' : 'var(--surface-1)',
                  border: '1px solid ' + (r.rank === 1 ? 'var(--gold-line)' : 'var(--line)') }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, width: 30, textAlign: 'center',
                    color: r.rank === 1 ? 'var(--gold)' : 'var(--faint)' }}>{r.rank}</span>
                  <div className="ph" style={{ width: 54, height: 54, borderRadius: 11, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>photo</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-card" style={{ fontSize: 14 }}>{r.title}</div>
                    <div className="meta" style={{ marginTop: 2 }}>{r.user}</div>
                  </div>
                  <span className="data" style={{ fontSize: 13, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 5 }}><IcStar size={14} /> {r.votes}</span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'events' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {COM_EVENTS.map((e, i) => (
            <div key={i} style={{ padding: 15, borderRadius: 16, background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="tag neutral">{e.tag}</span>
                <span style={{ flex: 1 }} />
                <span className="meta" style={{ color: 'var(--gold)' }}>{e.date}</span>
              </div>
              <div className="h-card" style={{ fontSize: 15.5, marginBottom: 4 }}>{e.title}</div>
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><IcPin size={12} /> {e.place}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="chip on" style={{ height: 36 }}>Participer</button>
                <span className="meta"><IcUsers size={12} /> {e.going} participants</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
