// Astror — vitrine. Amélioration progressive : la page reste complète sans JavaScript
// (la classe `js` est posée par un script en ligne dans <head>).

document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile
  const toggle = document.querySelector('.nav-toggle')
  const nav = document.getElementById('menu-principal')
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open))
    nav.classList.toggle('is-open', open)
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'))
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false) })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus() }
  })

  // Met en avant les instructions d'installation correspondant à l'appareil du visiteur
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  const platform = isIOS ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop'
  const card = document.querySelector(`.device[data-platform="${platform}"]`)
  if (card) {
    card.classList.add('is-current')
    card.querySelector('.device-badge').hidden = false
    card.parentElement.prepend(card)
  }
})
