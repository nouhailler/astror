import { useState } from 'react'
import { Sheet, DataRow, AiInfoPanel, WikiSummarySheet } from './ui'

// Fiche détaillée d'une constellation (entrée de CONSTELLATIONS_88) —
// partagée entre Explorer (liste des 88) et Ciel (carte). Gère sa propre
// fiche Wikipédia, ouverte au-dessus de la sheet.
export default function ConstellationSheet({ c, onClose }) {
  const [wikiOpen, setWikiOpen] = useState(false)
  const close = () => { setWikiOpen(false); onClose() }
  return (
    <>
      <Sheet open={!!c} onClose={close}>
        {c && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {c.zodiac && <span className="tag">Zodiaque</span>}
              <span className="tag neutral">{c.hemi === 'N' ? 'Boréale' : c.hemi === 'S' ? 'Australe' : 'Équatoriale'}</span>
              <span className="tag neutral">{c.season}</span>
            </div>
            <div className="h-sec" style={{ fontSize: 25, marginBottom: 3 }}>{c.fr}</div>
            <div className="meta" style={{ color: 'var(--gold)', fontStyle: 'italic', marginBottom: 16 }}>{c.la}</div>

            <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.65, margin: '0 0 16px' }}>{c.hist}</p>

            <AiInfoPanel cacheKey={`cons88_${c.id}`} style={{ marginBottom: 18 }}
              buildPrompt={`Constellation : ${c.fr} (${c.la}). Étoile la plus brillante : ${c.star}. ${c.hist}

En 5 phrases, approfondis l'histoire et la mythologie de cette constellation, puis explique concrètement comment la repérer dans le ciel (repères voisins, meilleure période) et cite un objet céleste intéressant à y observer avec un instrument amateur.`} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <DataRow k="Étoile principale" v={c.star} accent />
              <DataRow k="Meilleure saison" v={c.season} />
              <DataRow k="Hémisphère" v={c.hemi === 'N' ? 'Boréal' : c.hemi === 'S' ? 'Austral' : 'Équatorial'} />
              <DataRow k="Superficie" v={`${c.area} deg² · ${c.rank}ᵉ/88`} />
            </div>

            <button onClick={() => setWikiOpen(true)} className="press"
              style={{ width: '100%', marginTop: 20, height: 48, borderRadius: 14, cursor: 'pointer',
                border: '1px solid var(--gold-line)', background: 'var(--gold-soft)', color: 'var(--gold)',
                fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Fiche Wikipédia
            </button>
          </div>
        )}
      </Sheet>
      <WikiSummarySheet open={wikiOpen && !!c} wikiPage={c?.wiki} label={c?.fr}
        onClose={() => setWikiOpen(false)} />
    </>
  )
}
