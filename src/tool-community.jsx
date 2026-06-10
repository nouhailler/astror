import { useState, useMemo } from 'react'
import { IcTrophy, IcStar, IcSpark, IcUsers, IcPin } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { fetchAstroClubEvents, fetchCommunityRanking, fetchCommunityFeed, getCommunitySheetUrl, useLiveData } from './api'

// ─── Données statiques (fallback) ────────────────────────────────────────────

const COM_POSTS = [
  { user: 'Camille N.', init: 'CN', when: 'il y a 2 h', obj: 'M51 — Galaxie du Tourbillon', gear: 'Newton 200/1000', likes: 142, comments: 18, top: true, label: 'photo · M51' },
  { user: 'Théo R.',    init: 'TR', when: 'il y a 5 h', obj: 'Lune gibbeuse au terminateur',  gear: 'Mak 127',       likes: 89,  comments: 7,  label: 'photo · Lune' },
  { user: 'Awa D.',     init: 'AD', when: 'hier',       obj: 'Nébuleuse de l\'Amérique du Nord', gear: 'Lunette 80ED', likes: 207, comments: 24, top: true, label: 'photo · NGC 7000' },
]

const COM_RANK_STATIC = [
  { rank: 1, user: 'Awa D.',      title: 'NGC 7000 — Amérique du Nord', votes: 207, desc: 'Nébuleuse en émission dans le Cygne' },
  { rank: 2, user: 'Camille N.',  title: 'M51 — Tourbillon',            votes: 142, desc: 'Interaction gravitationnelle M51/NGC 5195' },
  { rank: 3, user: 'Léo B.',      title: 'Voie Lactée — Cévennes',      votes: 118, desc: 'Ciel Bortle 2, cœur galactique' },
]

const COM_EVENTS_STATIC = [
  { title: 'Nuit des étoiles',              place: 'Observatoire de Meudon',     date: '8 août 2026',      going: 142, tag: 'Soirée' },
  { title: 'Club d\'astronomie de Paris',   place: 'Réunion mensuelle · 19 h',   date: 'Tous les 2ᵉ mardis', going: 38, tag: 'Club' },
  { title: 'Star party des Cévennes',       place: 'Mont Aigoual · Bortle 2',    date: '14–16 août 2026',  going: 96,  tag: 'Sortie' },
  { title: 'Initiation au télescope',       place: 'Parc de la Villette',        date: '21 juin 2026',     going: 54,  tag: 'Atelier' },
]

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ padding: 15, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
      {[['60%', 12], ['100%', 11], ['80%', 10]].map(([w, h], i) => (
        <div key={i} style={{ height: h, borderRadius: 6, marginBottom: 10,
          width: w, background: 'var(--surface-2)',
          animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.14 + 's' }} />
      ))}
    </div>
  )
}

function StatusBanner({ children, color = 'var(--faint)', bg = 'var(--surface-1)', border = 'var(--line)' }) {
  return (
    <div style={{ margin: '14px 0 4px', padding: '10px 13px', borderRadius: 12,
      background: bg, border: `1px solid ${border}`, fontSize: 12.5, color, lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

function EventNewsCard({ e }) {
  return (
    <div style={{ padding: 15, borderRadius: 16,
      background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="tag neutral">{e.tag}</span>
        <span style={{ flex: 1 }} />
        <span className="meta" style={{ color: 'var(--gold)' }}>{e.date}</span>
      </div>
      <div className="h-card" style={{ fontSize: 15, marginBottom: 5 }}>{e.title}</div>
      <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: e.desc ? 9 : 6 }}>
        <IcPin size={12} /> {e.place}
      </div>
      {e.desc && (
        <div className="body tight" style={{ fontSize: 12.5, marginBottom: 10, color: 'var(--dim)' }}>
          {e.desc}
        </div>
      )}
      {e.link && (
        <a href={e.link} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11.5, color: 'var(--gold)', fontFamily: 'var(--mono)',
            textDecoration: 'none', letterSpacing: '.04em' }}>
          Lire l'article →
        </a>
      )}
    </div>
  )
}

function EventStaticCard({ e }) {
  return (
    <div style={{ padding: 15, borderRadius: 16,
      background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="tag neutral">{e.tag}</span>
        <span style={{ flex: 1 }} />
        <span className="meta" style={{ color: 'var(--gold)' }}>{e.date}</span>
      </div>
      <div className="h-card" style={{ fontSize: 15.5, marginBottom: 4 }}>{e.title}</div>
      <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <IcPin size={12} /> {e.place}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="chip on" style={{ height: 36 }}>Participer</button>
        <span className="meta"><IcUsers size={12} /> {e.going} participants</span>
      </div>
    </div>
  )
}

function RankCard({ r, isLive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14,
      background: r.rank === 1 ? 'linear-gradient(180deg, rgba(217,179,108,.12), var(--surface-1))' : 'var(--surface-1)',
      border: '1px solid ' + (r.rank === 1 ? 'var(--gold-line)' : 'var(--line)') }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, width: 30, textAlign: 'center',
        color: r.rank === 1 ? 'var(--gold)' : 'var(--faint)', flexShrink: 0 }}>{r.rank}</span>
      {!isLive && (
        <div className="ph" style={{ width: 54, height: 54, borderRadius: 11, fontSize: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>photo</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="h-card" style={{ fontSize: 14 }}>{r.title}</div>
        <div className="meta" style={{ marginTop: 2 }}>{r.user}</div>
        {r.desc && <div className="body tight" style={{ fontSize: 11.5, marginTop: 3, color: 'var(--faint)' }}>{r.desc}</div>}
      </div>
      <span className="data" style={{ fontSize: 13, color: 'var(--gold)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 5 }}>
        <IcStar size={14} /> {r.votes}
      </span>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CommunityPage({ onBack }) {
  const [seg, setSeg] = useState('feed')
  const [likes, setLikes] = useState({})
  const toggleLike = (i) => setLikes(l => ({ ...l, [i]: !l[i] }))

  const sheetUrl = useMemo(() => getCommunitySheetUrl(), [])

  const { data: feedData, loading: feedLoading, error: feedError } =
    useLiveData(fetchCommunityFeed)

  const { data: eventsData, loading: eventsLoading, error: eventsError } =
    useLiveData(fetchAstroClubEvents)

  const { data: rankData, loading: rankLoading, error: rankError } =
    useLiveData(() => sheetUrl ? fetchCommunityRanking(sheetUrl) : Promise.reject(new Error('no-sheet')))

  const rankNotConfigured = !sheetUrl || rankError?.message === 'no-sheet' || rankError?.message === 'invalid-url'
  const rankFailed        = rankError && !rankNotConfigured

  return (
    <ToolPage title="Communauté" onBack={onBack}>
      <ToolSeg
        items={[{ key: 'feed', label: 'Fil' }, { key: 'rank', label: 'Classement' }, { key: 'events', label: 'Sorties' }]}
        value={seg} onChange={setSeg}
      />

      {/* ── Fil (Mastodon #astrophotography) ── */}
      {seg === 'feed' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {feedLoading && !feedData && [0, 1, 2].map(i => <SkeletonCard key={i} />)}

          {!feedLoading && feedError && (
            <StatusBanner bg="rgba(226,141,126,.06)" border="rgba(226,141,126,.28)" color="var(--faint)">
              Fil en direct indisponible — publications de démonstration affichées.
            </StatusBanner>
          )}

          {feedData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="dot pulse" style={{ background: 'var(--good)', width: 7, height: 7 }} />
              <span className="meta" style={{ color: 'var(--good)', fontSize: 11 }}>en direct · Mastodon · #astrophotography</span>
            </div>
          )}

          {(feedData || COM_POSTS).map((p, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px' }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15,
                  color: 'var(--gold)', background: 'radial-gradient(circle at 35% 30%, #1c2950, #0d1326)',
                  border: '1px solid var(--gold-line)' }}>{p.init}</span>
                <div style={{ flex: 1 }}>
                  <div className="h-card" style={{ fontSize: 14 }}>{p.user}</div>
                  <div className="meta" style={{ marginTop: 1 }}>{p.when}{p.gear ? ` · ${p.gear}` : ''}</div>
                </div>
                {p.top && <span className="tag"><IcTrophy size={11} /> Top</span>}
              </div>

              {p.imgUrl ? (
                <img src={p.imgUrl} alt={p.label || 'astrophoto'}
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div className="ph" style={{ height: 168, borderLeft: 0, borderRight: 0, borderRadius: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="meta" style={{ fontSize: 10, color: 'var(--faint)' }}>{p.label}</span>
                </div>
              )}

              <div style={{ padding: '12px 14px' }}>
                {p.obj && (
                  <div className="h-card" style={{ fontSize: 14, marginBottom: 10, fontFamily: 'var(--serif)' }}>{p.obj}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <button onClick={() => toggleLike(i)} className="press"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0,
                      cursor: 'pointer', color: likes[i] ? 'var(--gold)' : 'var(--dim)',
                      fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                    <IcStar size={16} /> {p.likes + (likes[i] ? 1 : 0)}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)',
                    fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                    <IcSpark size={15} /> {p.comments}
                  </span>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--gold)',
                        fontFamily: 'var(--mono)', textDecoration: 'none', letterSpacing: '.04em' }}>
                      Voir le post →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Classement (Google Sheets requis) ── */}
      {seg === 'rank' && (
        <div className="enter pad" style={{ paddingTop: 14 }}>
          {/* Bannière démo permanente quand non configuré */}
          <div style={{ borderRadius: 16, overflow: 'hidden',
            background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
            border: '1px solid var(--line)', marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
                {rankData ? '✅' : '❌'}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.08em',
                    color: rankData ? 'var(--good)' : 'var(--warn)',
                    background: rankData ? 'rgba(100,210,150,.12)' : 'rgba(226,141,126,.12)',
                    border: `1px solid ${rankData ? 'rgba(100,210,150,.3)' : 'rgba(226,141,126,.3)'}`,
                    borderRadius: 5, padding: '2px 7px' }}>
                    {rankData ? 'EN DIRECT' : 'DÉMO'}
                  </span>
                </div>
                <div className="body" style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--dim)' }}>
                  {rankData
                    ? 'Classement chargé depuis votre Google Sheets.'
                    : <>
                        Cette section nécessite une <strong style={{ color: 'var(--text)' }}>Google Sheets publique</strong> que vous gérez vous-même.
                        Configurez l'URL dans les{' '}
                        <strong style={{ color: 'var(--gold)' }}>Paramètres → Communauté · Classement</strong>.
                      </>
                  }
                </div>
                {rankFailed && (
                  <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--warn)' }}>
                    Impossible de charger la feuille. Vérifiez que l'URL est correcte et que la feuille est partagée en lecture publique.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="h-sec" style={{ fontSize: 15 }}>Photos du mois</span>
            {!rankData && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.06em',
                color: 'var(--warn)', background: 'rgba(226,141,126,.1)',
                border: '1px solid rgba(226,141,126,.25)', borderRadius: 4, padding: '2px 6px' }}>
                DÉMO
              </span>
            )}
          </div>

          {rankLoading && !rankData && !rankNotConfigured && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(rankData || COM_RANK_STATIC).map(r => (
              <RankCard key={r.rank} r={r} isLive={!!rankData} />
            ))}
          </div>
          {rankData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <span className="dot pulse" style={{ background: 'var(--good)', width: 7, height: 7 }} />
              <span className="meta" style={{ color: 'var(--good)', fontSize: 11 }}>données en direct · Google Sheets</span>
            </div>
          )}
        </div>
      )}

      {/* ── Sorties (RSS SAF + Futura Sciences) ── */}
      {seg === 'events' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {eventsLoading && !eventsData && [0, 1, 2].map(i => <SkeletonCard key={i} />)}

          {!eventsLoading && eventsError && (
            <>
              <StatusBanner bg="rgba(226,141,126,.06)" border="rgba(226,141,126,.28)" color="var(--faint)">
                Actualités en direct indisponibles (vérifiez votre connexion) — événements de démonstration affichés.
              </StatusBanner>
              {COM_EVENTS_STATIC.map((e, i) => <EventStaticCard key={i} e={e} />)}
            </>
          )}

          {eventsData && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className="dot pulse" style={{ background: 'var(--good)', width: 7, height: 7 }} />
                <span className="meta" style={{ color: 'var(--good)', fontSize: 11 }}>en direct · SAF · Futura Sciences</span>
              </div>
              {eventsData.map((e, i) => <EventNewsCard key={i} e={e} />)}
            </>
          )}
        </div>
      )}
    </ToolPage>
  )
}
