import { useState, useEffect, useRef } from 'react'
import { IcRocket, IcEye, IcPlus, IcTrash, IcChevron, IcCheck, IcSearch, IcBook } from './icons'
import { ScreenHeader, SettingsBtn, HeaderTools, Sheet } from './ui'
import { TipBanner } from './tips'
import { CONFERENCES, PEOPLE, BOOKS, PHOTO_SITES } from './data'
import { fetchSpaceNews, useLiveData, searchBooks, fetchBookCover, fetchConfImage, fetchSitePhotos } from './api'

const FEED_SEG = [
  { key: 'news', label: 'Actualités' },
  { key: 'conf', label: 'Conférences' },
  { key: 'people', label: 'Personnalités' },
  { key: 'books', label: 'Bibliothèque' },
  { key: 'sites', label: 'Photos du ciel' },
]

const FEED_ADDABLE = {
  news:   { singular: 'actualité',    sheet: 'Nouvelle actualité' },
  conf:   { singular: 'conférence',   sheet: 'Nouvelle conférence' },
  people: { singular: 'personnalité', sheet: 'Nouvelle personnalité' },
  books:  { singular: 'livre',        sheet: 'Nouveau livre' },
}

const FEED_FORMS = {
  news: [
    { k: 'title',  label: 'Titre', ph: 'Titre de l\'actualité', req: true },
    { k: 'org',    label: 'Organisation', ph: 'SpaceX, ESA, NASA…' },
    { k: 'cat',    label: 'Catégorie', ph: 'Lancement, Mission, Science…' },
    { k: 'when',   label: 'Date', ph: '12 juin 2026' },
    { k: 'url',    label: 'Lien de l\'article', ph: 'https://…' },
    { k: 'tag',    label: 'Statut', type: 'chips', opts: ['à venir', 'proche', 'trajet', 'publié'], def: 'à venir' },
    { k: 'detail', label: 'Description', type: 'area', ph: 'Résumé en une ou deux phrases.' },
  ],
  conf: [
    { k: 'name',  label: 'Nom de l\'événement', ph: 'European Astronomical Society 2026', req: true },
    { k: 'place', label: 'Lieu', ph: 'Cracovie, Pologne' },
    { k: 'date',  label: 'Dates', ph: '22–26 juin 2026' },
    { k: 'topic', label: 'Thème', ph: 'Réunion annuelle européenne' },
    { k: 'url',   label: 'Site web', ph: 'https://…' },
  ],
  people: [
    { k: 'name',  label: 'Nom', ph: 'Commencez à taper (3 car. min)…', req: true, type: 'person-combo' },
    { k: 'role',  label: 'Titre / distinction', ph: 'Prix Nobel 2011' },
    { k: 'field', label: 'Domaine', ph: 'Tension de Hubble' },
    { k: 'note',  label: 'Biographie', type: 'area', ph: 'Quelques phrases sur ses travaux.' },
  ],
  books: [
    { k: 'title',  label: 'Titre', ph: 'L\'Univers à portée de main', req: true },
    { k: 'author', label: 'Auteur', ph: 'Christophe Galfard' },
    { k: 'year',   label: 'Année', ph: '2015' },
    { k: 'note',   label: 'Résumé', type: 'area', ph: 'En quelques mots, de quoi parle ce livre.' },
  ],
}

const FEED_STORE = 'astror_veille_v1'
function feedLoad() { try { return JSON.parse(localStorage.getItem(FEED_STORE)) || {} } catch (e) { return {} } }
function feedSave(adds) { try { localStorage.setItem(FEED_STORE, JSON.stringify(adds)) } catch (e) {} }

const THUMB_STORE = 'astror_wiki_thumbs_v1'
function thumbLoad() { try { return JSON.parse(localStorage.getItem(THUMB_STORE)) || {} } catch { return {} } }
function thumbSave(cache) { try { localStorage.setItem(THUMB_STORE, JSON.stringify(cache)) } catch {} }

function usePersonThumb(person) {
  const [url, setUrl] = useState(() => {
    if (person.thumbUrl) return person.thumbUrl
    return thumbLoad()[person.name] || null
  })
  useEffect(() => {
    if (url || !person.wikiUrl) return
    const title = person.wikiUrl.split('/wiki/').pop()
    if (!title) return
    fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${title}`)
      .then(r => r.json())
      .then(d => {
        const src = d.thumbnail?.source
        if (src) {
          setUrl(src)
          const cache = thumbLoad()
          cache[person.name] = src
          thumbSave(cache)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.name])
  return url
}

const TAG_STYLE = { 'à venir': 'tag', proche: 'tag', trajet: 'tag neutral', publié: 'tag neutral' }

const WIKI_LINK_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 16,
  padding: '6px 13px', borderRadius: 99,
  background: 'rgba(217,179,108,.07)', border: '1px solid rgba(217,179,108,.25)',
  color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)',
  textTransform: 'uppercase', letterSpacing: '.07em', textDecoration: 'none',
}

function DelBtn({ onClick }) {
  return (
    <button className="del-btn press" title="Supprimer" onClick={(e) => { e.stopPropagation(); onClick() }}>
      <IcTrash size={14} />
    </button>
  )
}

function IcCal({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="2.2"/><path d="M4 9.5h16M8 3.5v3M16 3.5v3"/>
    </svg>
  )
}

function IcMic({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>
    </svg>
  )
}

function IcArrowUpR({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8"/>
    </svg>
  )
}

// Combobox avec auto-complétion Wikipédia pour les personnalités
function PersonCombobox({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [busy, setBusy] = useState(false)
  const debounce = useRef(null)

  const search = (q) => {
    onChange(q)
    clearTimeout(debounce.current)
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://fr.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=7&namespace=0&format=json&origin=*`
        )
        const [, titles, descs] = await res.json()
        setSuggestions(titles.map((t, i) => ({ title: t, desc: descs[i] || '' })))
        setOpen(true)
      } catch {}
    }, 320)
  }

  const pick = async (item) => {
    setOpen(false)
    setBusy(true)
    try {
      const res = await fetch(
        `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`
      )
      const d = await res.json()
      onSelect({
        name: d.title || item.title,
        role: d.description || '',
        note: (d.extract || '').replace(/<[^>]+>/g, '').slice(0, 280),
        wikiUrl: d.content_urls?.desktop?.page
          || `https://fr.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        thumbUrl: d.thumbnail?.source || null,
      })
    } catch {
      onChange(item.title)
    }
    setBusy(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input className="input" value={value}
          placeholder="Commencez à taper un nom (3 car. min)…"
          onChange={e => search(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          autoComplete="off" />
        {busy && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)',
                animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
          {suggestions.map((s, i) => (
            <button key={s.title} onMouseDown={() => pick(s)} style={{
              width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 0,
              borderBottom: i < suggestions.length - 1 ? '1px solid var(--line)' : 0,
              cursor: 'pointer', display: 'block',
            }}>
              <div className="h-card" style={{ fontSize: 13.5 }}>{s.title}</div>
              {s.desc && <div className="meta" style={{ marginTop: 2, color: 'var(--faint)' }}>{s.desc}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NewsView({ items, onPick, onDelete }) {
  return (
    <div className="enter pad" style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 8 }}>
      {items.map(n => (
        <div key={n.id} style={{ position: 'relative' }}>
          {n._user && <DelBtn onClick={() => onDelete(n.id)} />}
          <button onClick={() => onPick(n)} className="press" style={{ width: '100%', textAlign: 'left',
            background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
            borderRadius: 'var(--r-m)', padding: 16, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, paddingRight: n._user ? 28 : 0 }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--gold-soft)',
                border: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)' }}><IcRocket size={15} /></span>
              {(n.org || n.cat) && <span className="meta" style={{ color: 'var(--dim)', letterSpacing: '.12em' }}>{[n.org, n.cat].filter(Boolean).join(' · ')}</span>}
              <span style={{ flex: 1 }} />
              {n.tag && <span className={TAG_STYLE[n.tag] || 'tag neutral'}>{n.tag}</span>}
            </div>
            <div className="h-card" style={{ fontSize: 16, marginBottom: 5 }}>{n.title}</div>
            {n.detail && <div className="body tight" style={{ fontSize: 12.5, marginBottom: 9 }}>{n.detail.slice(0, 160)}{n.detail.length > 160 ? '…' : ''}</div>}
            {n.when && (
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)' }}>
                <IcCal size={13} /> {n.when}
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

const CONF_PALETTES = [
  ['#1c4268','#0e2138'], ['#321a5e','#190d32'], ['#1c4030','#0e2018'],
  ['#442610','#241408'], ['#1e3850','#0e1e2c'], ['#341852','#1c0c2c'],
]

function confAcronym(name) {
  const m = name.match(/[—–-]\s*([A-Z]{2,8})\b/) || name.match(/\b([A-Z]{2,8})\s*[—–-]/)
  if (m) return m[1]
  return name.split(/[\s—–/]+/).filter(w => /^[A-Z]/.test(w) && w.length > 1).map(w => w[0]).join('').slice(0, 5) || name.slice(0, 4).toUpperCase()
}

function confYear(date) {
  const m = (date || '').match(/\b(20\d{2})\b/)
  return m ? m[1] : ''
}

function ConfPoster({ name, date, size = 'full', imgUrl = null }) {
  const [c1, c2] = CONF_PALETTES[titleHash(name) % CONF_PALETTES.length]
  const acronym = confAcronym(name)
  const year = confYear(date)
  const isSmall = size === 'small'
  return (
    <div style={{ width: '100%', height: isSmall ? 64 : 96, borderRadius: isSmall ? 8 : 12,
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(145deg, ${c1}, ${c2})`,
      boxShadow: isSmall ? '0 2px 8px rgba(0,0,0,.4)' : '0 4px 16px rgba(0,0,0,.5)',
      border: '1px solid rgba(217,179,108,0.22)' }}>
      {imgUrl && (
        <img src={imgUrl} alt={name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: isSmall ? 0.18 : 0.25, mixBlendMode: 'luminosity' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: isSmall ? 18 : 26, fontWeight: 700,
          color: '#eef2fb', letterSpacing: '.06em', lineHeight: 1 }}>{acronym}</span>
        {year && <span style={{ fontFamily: 'var(--mono)', fontSize: isSmall ? 9 : 11,
          color: 'var(--gold)', letterSpacing: '.14em' }}>{year}</span>}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'rgba(217,179,108,0.35)' }} />
    </div>
  )
}

function ConfView({ items, onDelete }) {
  const [conf, setConf] = useState(null)
  const [imgs, setImgs] = useState(confImgLoad)
  const [refreshing, setRefreshing] = useState(false)

  const getImg = (c) => imgs[c.id] || imgs[c.name] || null

  const refresh = async () => {
    setRefreshing(true)
    const cache = { ...imgs }
    await Promise.all(items.filter(c => !getImg(c)).map(async c => {
      const url = await fetchConfImage(c.name, c.place)
      if (url) cache[c.id || c.name] = url
    }))
    setImgs(cache)
    confImgSave(cache)
    setRefreshing(false)
  }

  return (
    <div className="enter pad" style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="eyebrow" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.18em' }}>
          {items.length} événement{items.length > 1 ? 's' : ''}
        </span>
        <button onClick={refresh} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99,
            background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
            color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)', cursor: refreshing ? 'default' : 'pointer',
            opacity: refreshing ? 0.6 : 1, letterSpacing: '.04em' }}>
          {refreshing ? (
            <>{[0,1,2].map(i => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)',
                animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
            ))} Recherche…</>
          ) : <>↻ Images</>}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {items.map(c => (
          <div key={c.id} style={{ position: 'relative' }}>
            {c._user && (
              <button className="del-btn press" title="Supprimer"
                onClick={e => { e.stopPropagation(); onDelete(c.id) }}
                style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                <IcTrash size={13} />
              </button>
            )}
            <button onClick={() => setConf(c)} className="press"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', padding: 0, display: 'flex', flexDirection: 'column' }}>
              <ConfPoster name={c.name} date={c.date} imgUrl={getImg(c)} />
              <div style={{ marginTop: 9, paddingBottom: 2 }}>
                <div className="h-card" style={{ fontSize: 12, lineHeight: 1.3, marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.name}
                </div>
                {c.date && <div className="meta" style={{ fontSize: 10.5, color: 'var(--gold)', marginBottom: 2 }}>{c.date}</div>}
                {c.place && <div className="meta" style={{ fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.place}</div>}
              </div>
            </button>
          </div>
        ))}
      </div>

      <Sheet open={!!conf} onClose={() => setConf(null)}>
        {conf && (
          <div>
            <ConfPoster name={conf.name} date={conf.date} imgUrl={getImg(conf)} />
            <div style={{ marginTop: 18, marginBottom: 6 }}>
              <div className="h-sec" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 10 }}>{conf.name}</div>
              {conf.date && (
                <div className="meta" style={{ color: 'var(--gold)', fontSize: 13, marginBottom: 5,
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IcCal size={13} /> {conf.date}
                </div>
              )}
              {conf.place && <div className="meta" style={{ fontSize: 13, marginBottom: 5 }}>{conf.place}</div>}
              {conf.topic && <div className="tag" style={{ marginTop: 10 }}>{conf.topic}</div>}
            </div>
            {conf.url && (
              <a href={conf.url} target="_blank" rel="noopener noreferrer" style={{ ...WIKI_LINK_STYLE, marginTop: 18 }}>
                Site officiel <IcArrowUpR size={13} />
              </a>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}

function PersonAvatar({ person, thumb, size = 46 }) {
  if (thumb) {
    return (
      <img src={thumb} alt={person.name}
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
          objectFit: 'cover', objectPosition: 'top center',
          border: '1px solid var(--gold-line)' }} />
    )
  }
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', fontSize: size * 0.42, fontWeight: 500,
      color: 'var(--gold)', background: 'radial-gradient(circle at 35% 30%, #1c2950, #0d1326)',
      border: '1px solid var(--gold-line)' }}>
      {person.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
    </span>
  )
}

function PersonCard({ person, onPick, onDelete }) {
  const thumb = usePersonThumb(person)
  return (
    <div style={{ position: 'relative' }}>
      {person._user && <DelBtn onClick={() => onDelete(person.id)} />}
      <button onClick={() => onPick(thumb ? { ...person, thumbUrl: thumb } : person)}
        className="press" style={{ width: '100%', textAlign: 'left', display: 'flex',
          gap: 14, alignItems: 'center', background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
          border: '1px solid var(--line)', borderRadius: 'var(--r-m)', padding: 14, cursor: 'pointer' }}>
        <PersonAvatar person={person} thumb={thumb} />
        <span style={{ flex: 1, minWidth: 0, paddingRight: person._user ? 24 : 0 }}>
          <span className="h-card" style={{ fontSize: 15 }}>{person.name}</span>
          <span style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            {person.role && <span className="meta" style={{ color: 'var(--gold)' }}>{person.role}</span>}
            {person.role && person.field && <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--faint)' }} />}
            {person.field && <span className="meta">{person.field}</span>}
          </span>
        </span>
        <IcChevron size={17} className="arrow" />
      </button>
    </div>
  )
}

function PeopleView({ items, onPick, onDelete }) {
  return (
    <div className="enter pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      {items.map(p => (
        <PersonCard key={p.id} person={p} onPick={onPick} onDelete={onDelete} />
      ))}
    </div>
  )
}

const BOOK_COVER_STORE = 'astror_book_covers_v1'
function bookCoverLoad() { try { return JSON.parse(localStorage.getItem(BOOK_COVER_STORE)) || {} } catch { return {} } }
function bookCoverSave(c) { try { localStorage.setItem(BOOK_COVER_STORE, JSON.stringify(c)) } catch {} }

const CONF_IMG_STORE = 'astror_conf_imgs_v1'
function confImgLoad() { try { return JSON.parse(localStorage.getItem(CONF_IMG_STORE)) || {} } catch { return {} } }
function confImgSave(c) { try { localStorage.setItem(CONF_IMG_STORE, JSON.stringify(c)) } catch {} }

const COVER_PALETTES = [
  ['#213d6e','#111e3a'], ['#352055','#1b1030'], ['#1d4030','#0e2018'],
  ['#4a2410','#2a1408'], ['#342a10','#1c1808'], ['#203554','#101c2e'],
  ['#361f45','#1c1028'], ['#1f3a3a','#102020'],
]

function titleHash(s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

function BookCover({ title, author, size = 'full', coverUrl = null }) {
  const [c1, c2] = COVER_PALETTES[titleHash(title) % COVER_PALETTES.length]
  const isSmall = size === 'small'
  const box = {
    width: '100%', aspectRatio: '2/3', position: 'relative',
    borderRadius: isSmall ? 5 : 8, overflow: 'hidden',
    boxShadow: isSmall
      ? '2px 3px 8px rgba(0,0,0,.5), inset -2px 0 4px rgba(0,0,0,.3)'
      : '4px 6px 18px rgba(0,0,0,.6), inset -3px 0 7px rgba(0,0,0,.35)',
    border: '1px solid rgba(217,179,108,0.20)',
  }
  if (coverUrl) {
    return (
      <div style={{ ...box, background: 'var(--surface-2)' }}>
        <img src={coverUrl} alt={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{ ...box, background: `linear-gradient(148deg, ${c1}, ${c2})` }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        padding: isSmall ? '7px 6px' : '11px 10px' }}>
        <div style={{ height: 2, background: 'rgba(217,179,108,0.60)', borderRadius: 1,
          marginBottom: isSmall ? 5 : 8 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: isSmall ? 9 : 11.5,
            color: '#eef2fb', lineHeight: 1.4, textAlign: 'center', fontWeight: 500 }}>{title}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(217,179,108,0.30)',
          paddingTop: isSmall ? 4 : 6, marginTop: isSmall ? 4 : 5 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: isSmall ? 6.5 : 7.5, color: 'var(--gold)',
            letterSpacing: '.07em', display: 'block', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(author || '').split(' ').filter(Boolean).pop()?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

const SOURCE_LABEL = { google: 'Google Books', openlibrary: 'Open Library' }

function BooksView({ items, onAdd, onDelete }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState(null)
  const [book, setBook]       = useState(null)
  const [covers, setCovers]   = useState(bookCoverLoad)
  const [refreshing, setRefreshing] = useState(false)
  const debounceRef = useRef(null)

  const getCover = (b) => b.coverUrl || covers[b.id] || covers[b.title] || null

  const refresh = async () => {
    setRefreshing(true)
    const cache = { ...covers }
    const toFetch = items.filter(b => !getCover(b))
    await Promise.all(toFetch.map(async b => {
      const url = await fetchBookCover(b.title, b.author)
      if (url) cache[b.id || b.title] = url
    }))
    setCovers(cache)
    bookCoverSave(cache)
    setRefreshing(false)
  }

  const doSearch = (q) => {
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (q.trim().length < 3) { setResults(null); setSearchErr(null); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true); setSearchErr(null)
      try {
        setResults(await searchBooks(q.trim()))
      } catch {
        setSearchErr('Erreur de recherche. Vérifiez votre connexion.')
        setResults([])
      } finally { setSearching(false) }
    }, 500)
  }

  const addResult = (b) => onAdd({ title: b.title, author: b.author, year: b.year, note: b.note, url: b.url, coverUrl: b.coverUrl || '', source: b.source })
  const alreadyAdded = (b) => items.some(x => x._user && x.title === b.title)

  const bookIdx = (b) => items.findIndex(x => x.id === b.id)

  return (
    <div className="enter pad" style={{ marginTop: 8 }}>
      {/* Barre de recherche */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--faint)', pointerEvents: 'none' }}>
          <IcSearch size={15} />
        </div>
        <input className="input" placeholder="Rechercher un livre…"
          value={query} onChange={e => doSearch(e.target.value)}
          style={{ paddingLeft: 36, paddingRight: searching ? 44 : undefined }} />
        {searching && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)',
                animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {results !== null && (
        <div style={{ marginBottom: 20 }}>
          {searchErr && <div style={{ color: 'var(--bad)', fontSize: 13, padding: '6px 2px' }}>{searchErr}</div>}
          {!searchErr && results.length === 0 && !searching && (
            <div style={{ color: 'var(--faint)', fontSize: 13, textAlign: 'center', padding: '14px 0' }}>Aucun résultat</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map(b => (
              <div key={b.id} style={{ display: 'flex', gap: 12, padding: '12px 14px',
                background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
                border: '1px solid var(--line)', borderRadius: 'var(--r-m)', alignItems: 'flex-start' }}>
                <div style={{ width: 38, flexShrink: 0 }}>
                  <BookCover title={b.title} author={b.author} size="small" coverUrl={b.coverUrl || null} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span className="h-card" style={{ fontSize: 13, fontFamily: 'var(--serif)', flex: 1, lineHeight: 1.3 }}>{b.title}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, flexShrink: 0, whiteSpace: 'nowrap',
                      background: 'rgba(126,166,230,.08)', color: 'var(--blue)', border: '1px solid rgba(126,166,230,.18)',
                      fontFamily: 'var(--mono)', letterSpacing: '.04em', alignSelf: 'flex-start', marginTop: 1 }}>
                      {SOURCE_LABEL[b.source]}
                    </span>
                  </div>
                  {(b.author || b.year) && (
                    <div className="meta" style={{ color: 'var(--gold)', fontSize: 11, marginBottom: b.note ? 4 : 0 }}>
                      {[b.author, b.year].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {b.note && <div className="body tight" style={{ fontSize: 11 }}>{b.note.slice(0, 110)}{b.note.length > 110 ? '…' : ''}</div>}
                </div>
                <button className={'chip' + (alreadyAdded(b) ? ' on' : '')}
                  style={{ height: 28, fontSize: 11, flexShrink: 0, paddingInline: 10 }}
                  disabled={alreadyAdded(b)} onClick={() => addResult(b)}>
                  {alreadyAdded(b) ? <IcCheck size={11} /> : '+'}
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span className="eyebrow" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.18em' }}>Sélection</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
        </div>
      )}

      {/* Grille bibliothèque */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="eyebrow" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.18em' }}>
          {items.length} livre{items.length > 1 ? 's' : ''}
        </span>
        <button onClick={refresh} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99,
            background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
            color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)', cursor: refreshing ? 'default' : 'pointer',
            opacity: refreshing ? 0.6 : 1, letterSpacing: '.04em' }}>
          {refreshing ? (
            <>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)',
                  animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
              ))}
              Recherche…
            </>
          ) : <>↻ Couvertures</>}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {items.map((b, i) => (
          <div key={b.id} style={{ position: 'relative' }}>
            {b._user && (
              <button className="del-btn press" title="Supprimer"
                onClick={e => { e.stopPropagation(); onDelete(b.id) }}
                style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                <IcTrash size={13} />
              </button>
            )}
            <button onClick={() => setBook(b)} className="press"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', padding: 0, display: 'flex', flexDirection: 'column' }}>
              <BookCover title={b.title} author={b.author} coverUrl={getCover(b)} />
              <div style={{ marginTop: 9, paddingBottom: 2 }}>
                <div className="h-card" style={{ fontSize: 12.5, lineHeight: 1.3, marginBottom: 3,
                  fontFamily: 'var(--serif)', display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</div>
                {b.author && (
                  <div className="meta" style={{ fontSize: 11, color: 'var(--gold)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.author}</div>
                )}
                {b.year && <div className="meta" style={{ fontSize: 10.5, marginTop: 1 }}>{b.year}</div>}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Fiche livre */}
      <Sheet open={!!book} onClose={() => setBook(null)}>
        {book && (
          <div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 22, alignItems: 'flex-start' }}>
              <div style={{ width: 88, flexShrink: 0 }}>
                <BookCover title={book.title} author={book.author} coverUrl={getCover(book)} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <div className="h-sec" style={{ fontSize: 21, lineHeight: 1.2, marginBottom: 8 }}>{book.title}</div>
                {book.author && <div className="meta" style={{ color: 'var(--gold)', fontSize: 13, marginBottom: 4 }}>{book.author}</div>}
                {book.year && <div className="meta" style={{ fontSize: 12 }}>{book.year}</div>}
              </div>
            </div>
            {book.note && <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 4 }}>{book.note}</p>}
            {book.url && (
              <a href={book.url} target="_blank" rel="noopener noreferrer" style={WIKI_LINK_STYLE}>
                Voir sur {SOURCE_LABEL[book.source] || 'le web'} <IcArrowUpR size={13} />
              </a>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}

const SITE_PHOTOS_STORE = 'astror_site_photos_v1'
function sitePhotosLoad() { try { return JSON.parse(localStorage.getItem(SITE_PHOTOS_STORE)) || {} } catch { return {} } }
function sitePhotosSave(c) { try { localStorage.setItem(SITE_PHOTOS_STORE, JSON.stringify(c)) } catch {} }

function SiteCard({ site, index, total }) {
  const [photos, setPhotos] = useState(() => sitePhotosLoad()[site.id] || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (photos !== null) return
    setLoading(true)
    fetchSitePhotos(site.id)
      .then(urls => {
        setPhotos(urls)
        const cache = sitePhotosLoad()
        cache[site.id] = urls
        sitePhotosSave(cache)
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.id])

  return (
    <div style={{ borderBottom: index < total - 1 ? '1px solid var(--line)' : 0 }}>
      <a href={'https://' + site.url} target="_blank" rel="noreferrer" className="press"
        style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 15px', textDecoration: 'none' }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)',
          border: '1px solid var(--gold-line)' }}><IcEye size={18} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="h-card" style={{ fontSize: 14.5 }}>{site.name}</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{site.note}</span>
        </span>
        <span className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {site.url} <IcArrowUpR size={15} />
        </span>
      </a>
      {loading && (
        <div style={{ display: 'flex', gap: 5, padding: '0 15px 14px', alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--faint)',
              animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      )}
      {photos && photos.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 15px 14px',
          overflowX: 'auto', scrollbarWidth: 'none' }}>
          {photos.map((url, i) => (
            <a key={i} href={'https://' + site.url} target="_blank" rel="noreferrer"
              style={{ flexShrink: 0, width: 96, height: 64, borderRadius: 8, overflow: 'hidden',
                border: '1px solid var(--line-2)', display: 'block' }}>
              <img src={url} alt="" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function SitesView() {
  return (
    <div className="enter pad" style={{ marginTop: 8 }}>
      <div className="card-2" style={{ overflow: 'hidden' }}>
        {PHOTO_SITES.map((s, i) => (
          <SiteCard key={s.id} site={s} index={i} total={PHOTO_SITES.length} />
        ))}
      </div>
    </div>
  )
}

function AddSheet({ seg, open, onClose, onAdd }) {
  const fields = FEED_FORMS[seg] || []
  const meta = FEED_ADDABLE[seg]
  const [form, setForm] = useState({})

  useEffect(() => {
    if (!open) return
    const init = {}
    fields.forEach(f => { if (f.def) init[f.k] = f.def })
    setForm(init)
  }, [open, seg])

  const reqField = fields.find(f => f.req)
  const valid = !reqField || (form[reqField.k] || '').trim().length > 0
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const setAll = (obj) => setForm(prev => ({ ...prev, ...obj }))

  const submit = () => {
    if (!valid) return
    const clean = {}
    fields.forEach(f => { const v = (form[f.k] || '').trim(); if (v) clean[f.k] = v })
    if (form.wikiUrl) clean.wikiUrl = form.wikiUrl
    if (form.thumbUrl) clean.thumbUrl = form.thumbUrl
    onAdd(seg, clean)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {meta && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Ajouter à la veille</div>
          <div className="h-sec" style={{ fontSize: 24, marginBottom: 22 }}>{meta.sheet}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(f => (
              <div key={f.k}>
                <label className="field-label">{f.label}{f.req && <span style={{ color: 'var(--gold)' }}> *</span>}</label>
                {f.type === 'person-combo' ? (
                  <PersonCombobox
                    value={form[f.k] || ''}
                    onChange={v => set(f.k, v)}
                    onSelect={data => setAll({ name: data.name, role: data.role, note: data.note, wikiUrl: data.wikiUrl })}
                  />
                ) : f.type === 'area' ? (
                  <textarea className="textarea" placeholder={f.ph} value={form[f.k] || ''}
                    onChange={e => set(f.k, e.target.value)} />
                ) : f.type === 'chips' ? (
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {f.opts.map(opt => (
                      <button key={opt} type="button" className={'chip' + ((form[f.k] || f.def) === opt ? ' on' : '')}
                        onClick={() => set(f.k, opt)}>{opt}</button>
                    ))}
                  </div>
                ) : (
                  <input className="input" placeholder={f.ph} value={form[f.k] || ''}
                    onChange={e => set(f.k, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 24 }} disabled={!valid} onClick={submit}>
            <IcCheck size={18} /> Ajouter
          </button>
          <div className="meta" style={{ textAlign: 'center', marginTop: 12, color: 'var(--faint)' }}>
            Enregistré sur cet appareil
          </div>
        </div>
      )}
    </Sheet>
  )
}

export default function FeedScreen({ deepLink, onDeepLinkConsumed }) {
  const [seg, setSeg] = useState('news')
  const [news, setNews] = useState(null)
  const [person, setPerson] = useState(null)
  const [adding, setAdding] = useState(false)
  const [adds, setAdds] = useState(feedLoad)

  useEffect(() => {
    if (deepLink) { setSeg(deepLink); onDeepLinkConsumed?.() }
  }, [deepLink])

  const { data: liveNews, loading: newsLoading } = useLiveData(fetchSpaceNews)

  const addItem = (key, data) => {
    setAdds(prev => {
      const next = { ...prev, [key]: [{ id: key + '-' + Date.now(), _user: true, ...data }, ...(prev[key] || [])] }
      feedSave(next)
      return next
    })
  }
  const delItem = (key, id) => {
    setAdds(prev => {
      const next = { ...prev, [key]: (prev[key] || []).filter(x => x.id !== id) }
      feedSave(next)
      return next
    })
  }

  const newsList   = [...(adds.news || []),   ...(liveNews || [])]
  const confList   = [...(adds.conf || []),    ...CONFERENCES]
  const peopleList = [...(adds.people || []),  ...PEOPLE]
  const booksList  = [...(adds.books || []),   ...BOOKS]
  const canAdd = !!FEED_ADDABLE[seg]

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow="Suivre l'actualité" title="Veille" right={
        <HeaderTools>
          {canAdd && (
            <button className="add-pill" onClick={() => setAdding(true)}>
              <IcPlus size={16} /> Ajouter
            </button>
          )}
          <SettingsBtn />
        </HeaderTools>
      } />
      <TipBanner tipKey="feed" />
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 18px 4px', scrollbarWidth: 'none' }}>
        {FEED_SEG.map(s => (
          <button key={s.key} className={'chip' + (seg === s.key ? ' on' : '')} onClick={() => setSeg(s.key)}>{s.label}</button>
        ))}
      </div>
      {seg === 'news'   && (newsLoading && !newsList.length
        ? <div style={{ textAlign: 'center', color: 'var(--faint)', padding: '40px 18px', fontSize: 13 }}>Chargement des actualités…</div>
        : <NewsView items={newsList} onPick={setNews} onDelete={id => delItem('news', id)} />)}
      {seg === 'conf'   && <ConfView   items={confList}   onDelete={id => delItem('conf', id)} />}
      {seg === 'people' && <PeopleView items={peopleList} onPick={setPerson} onDelete={id => delItem('people', id)} />}
      {seg === 'books'  && <BooksView  items={booksList}  onAdd={data => addItem('books', data)} onDelete={id => delItem('books', id)} />}
      {seg === 'sites'  && <SitesView />}

      <AddSheet seg={seg} open={adding} onClose={() => setAdding(false)} onAdd={addItem} />

      {/* Sheet actualité */}
      <Sheet open={!!news} onClose={() => setNews(null)}>
        {news && (
          <div>
            {(news.org || news.cat) && <div className="tag" style={{ marginBottom: 12 }}>{[news.org, news.cat].filter(Boolean).join(' · ')}</div>}
            <div className="h-sec" style={{ fontSize: 25, marginBottom: 8, lineHeight: 1.15 }}>{news.title}</div>
            {news.when && (
              <div className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <IcCal size={14} /> {news.when}
              </div>
            )}
            {news.detail && <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62, marginBottom: 16 }}>{news.detail}</p>}
            {news.url && (
              <a href={news.url} target="_blank" rel="noopener noreferrer" style={WIKI_LINK_STYLE}>
                Lire l'article complet →
              </a>
            )}
          </div>
        )}
      </Sheet>

      {/* Sheet personnalité */}
      <Sheet open={!!person} onClose={() => setPerson(null)}>
        {person && (
          <div>
            {person.thumbUrl ? (
              <div style={{ marginBottom: 20 }}>
                <img src={person.thumbUrl} alt={person.name}
                  style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
                    objectPosition: 'top center', border: '2px solid var(--gold-line)',
                    display: 'block', marginBottom: 14 }} />
                <div className="h-sec" style={{ fontSize: 22 }}>{person.name}</div>
                {person.role && <div className="meta" style={{ color: 'var(--gold)', marginTop: 4 }}>{person.role}</div>}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <PersonAvatar person={person} thumb={null} size={58} />
                <div style={{ flex: 1 }}>
                  <div className="h-sec" style={{ fontSize: 22 }}>{person.name}</div>
                  {person.role && <div className="meta" style={{ color: 'var(--gold)', marginTop: 4 }}>{person.role}</div>}
                </div>
              </div>
            )}
            {person.field && <div className="tag" style={{ marginBottom: 16 }}>{person.field}</div>}
            {person.note && <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62, marginBottom: 4 }}>{person.note}</p>}
            <a
              href={person.wikiUrl || `https://fr.wikipedia.org/wiki/${encodeURIComponent(person.name)}`}
              target="_blank" rel="noopener noreferrer"
              style={WIKI_LINK_STYLE}>
              Voir sur Wikipédia →
            </a>
          </div>
        )}
      </Sheet>
    </div>
  )
}
