const Icon = ({ d, size = 22, sw = 1.6, fill = 'none', children, vb = '0 0 24 24', style }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
)

export const IcSky = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18" />
    <circle cx="9" cy="8" r=".7" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="10" r=".7" fill="currentColor" stroke="none" />
    <circle cx="13" cy="15" r=".7" fill="currentColor" stroke="none" />
    <circle cx="8" cy="14" r=".7" fill="currentColor" stroke="none" />
  </Icon>
)
export const IcMoon = (p) => (
  <Icon {...p}><path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.6 6.6 0 0 0 10.8 10.8Z" /></Icon>
)
export const IcOrbit = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-28 12 12)" />
    <circle cx="20.4" cy="8.4" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
)
export const IcBook = (p) => (
  <Icon {...p}>
    <path d="M4 5.2A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.2Z" />
    <path d="M20 5.2A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.2Z" />
  </Icon>
)
export const IcSpark = (p) => (
  <Icon {...p}>
    <path d="M12 3c.4 4.3 1.7 5.6 6 6-4.3.4-5.6 1.7-6 6-.4-4.3-1.7-5.6-6-6 4.3-.4 5.6-1.7 6-6Z" />
    <path d="M19 4.2c.13 1.1.5 1.5 1.6 1.6-1.1.13-1.47.5-1.6 1.6-.13-1.1-.5-1.47-1.6-1.6 1.1-.13 1.47-.5 1.6-1.6Z" fill="currentColor" stroke="none"/>
  </Icon>
)

export const IcChevron = (p) => <Icon {...p} d="M9 6l6 6-6 6" />
export const IcChevDown = (p) => <Icon {...p} d="M6 9l6 6 6-6" />
export const IcArrowUpR = (p) => <Icon {...p} d="M7 17 17 7M9 7h8v8" />
export const IcClose = (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18" />
export const IcPin = (p) => <Icon {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></Icon>
export const IcBell = (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10.5 19a1.8 1.8 0 0 0 3 0"/></Icon>
export const IcClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></Icon>
export const IcCal = (p) => <Icon {...p}><rect x="4" y="5" width="16" height="15" rx="2.2"/><path d="M4 9.5h16M8 3.5v3M16 3.5v3"/></Icon>
export const IcSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></Icon>
export const IcSend = (p) => <Icon {...p} d="M5 12 19 5l-4 14-3.5-5L5 12Z" />
export const IcStar = (p) => <Icon {...p} d="M12 3.5l2.4 5.4 5.9.5-4.5 3.9 1.4 5.8L12 16.9 6.8 19.1l1.4-5.8-4.5-3.9 5.9-.5Z" />
export const IcEye = (p) => <Icon {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></Icon>
export const IcCompass = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5Z"/></Icon>
export const IcWind = (p) => <Icon {...p} d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5M3 12h16a2.5 2.5 0 1 1-2.5 2.5M3 16h8a2.2 2.2 0 1 1-2.2 2.2" />
export const IcTele = (p) => <Icon {...p}><path d="M3 13.5 16 9l1.5 4L4.5 17.5Z"/><path d="M9.5 11.2 11 15M12.5 19l-1.5-4M9 19l1.2-3"/><path d="m15 7 3.5-1 1.2 3.4-3.5 1"/></Icon>
export const IcRocket = (p) => <Icon {...p}><path d="M5 14c-1 2-1 5-1 5s3 0 5-1m-4-4c0-5 3.5-9 11-10 0 7.5-5 11-10 11Zm0 0 3 3"/><circle cx="14.5" cy="9.5" r="1.4"/></Icon>
export const IcMic = (p) => <Icon {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></Icon>
export const IcLayers = (p) => <Icon {...p} d="M12 3 3 8l9 5 9-5-9-5ZM4 12l8 4.5L20 12M4 16l8 4.5L20 16" />
export const IcWave = (p) => <Icon {...p} d="M3 12c2 0 2-5 4-5s2 10 4 10 2-10 4-10 2 5 4 5" />
export const IcPlus = (p) => <Icon {...p} d="M12 5v14M5 12h14" />
export const IcTrash = (p) => <Icon {...p}><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13"/></Icon>
export const IcCheck = (p) => <Icon {...p} d="M5 12.5 10 17l9-10" />
export const IcSliders = (p) => <Icon {...p}><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.3"/><circle cx="9" cy="17" r="2.3"/></Icon>
export const IcArrowLeft = (p) => <Icon {...p} d="M19 12H5M11 6l-6 6 6 6" />
export const IcBino = (p) => <Icon {...p}><path d="M5 9V6.5A1.5 1.5 0 0 1 6.5 5h1A1.5 1.5 0 0 1 9 6.5V9M15 9V6.5A1.5 1.5 0 0 1 16.5 5h1A1.5 1.5 0 0 1 19 6.5V9"/><circle cx="6.5" cy="13" r="4"/><circle cx="17.5" cy="13" r="4"/><path d="M10.5 12h3"/></Icon>
export const IcGrid = (p) => <Icon {...p}><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></Icon>
export const IcCamera = (p) => <Icon {...p}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2L9 5h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z"/><circle cx="12" cy="12.5" r="3.4"/></Icon>
export const IcComet = (p) => <Icon {...p}><circle cx="16.5" cy="7.5" r="3.2"/><path d="M14 10 4 20M9.5 11.5 5.5 15.5M13 15l-3 3"/></Icon>
export const IcSat = (p) => <Icon {...p}><path d="M5 13l-2 2 3 3 2-2M11 7 7 11M17 19l2-2-3-3-2 2"/><path d="M9 9l6 6"/><path d="M15 4a5 5 0 0 1 5 5"/><path d="M15 8a1 1 0 0 1 1 1"/></Icon>
export const IcUsers = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6M17.5 19a5.4 5.4 0 0 0-3-4.8"/></Icon>
export const IcCap = (p) => <Icon {...p}><path d="M2.5 9 12 5l9.5 4L12 13Z"/><path d="M6 11v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5V11"/><path d="M21.5 9v4.5"/></Icon>
export const IcGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 2.6 15 0 18M12 3c-2.6 2.5-2.6 15 0 18"/></Icon>
export const IcClip = (p) => <Icon {...p}><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6H9ZM9 11h6M9 15h4"/></Icon>
export const IcCloud = (p) => <Icon {...p}><path d="M7.5 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.3A3.6 3.6 0 0 1 17 18Z"/></Icon>
export const IcGem = (p) => <Icon {...p}><path d="M6 4h12l3 5-9 11L3 9Z"/><path d="M3 9h18M9 4 7.5 9 12 20 16.5 9 15 4"/></Icon>
export const IcTimer = (p) => <Icon {...p}><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9M9.5 2.5h5M19 6l1.5-1.5"/></Icon>
export const IcTrophy = (p) => <Icon {...p}><path d="M7 5h10v3a5 5 0 0 1-10 0Z"/><path d="M7 6H4.5v1A3.5 3.5 0 0 0 7 10.3M17 6h2.5v1A3.5 3.5 0 0 1 17 10.3M9.5 13.5h5M9 20h6M12 13v3"/></Icon>
export const IcHelp = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none"/></Icon>
export const IcZap = (p) => <Icon {...p} d="M13 3 5 13h5l-1 8 8-10h-5Z" />
export const IcGauge = (p) => <Icon {...p}><path d="M4 15a8 8 0 0 1 16 0"/><path d="M12 15l4-3.5"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/></Icon>
export const IcPlay = (p) => <Icon {...p}><path d="M8 5.5v13l11-6.5Z"/></Icon>
export const IcCheckCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5"/></Icon>
export const IcFlame = (p) => <Icon {...p}><path d="M12 3c.5 3 4.5 4.2 4.5 8.5A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.5C7.5 9 9 8 9 6c1.5.5 2.4 1.6 2.4 1.6S11 5 12 3Z"/></Icon>
export const IcWrench = (p) => <Icon {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></Icon>
export const IcPlanet = (p) => <Icon {...p}><circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="11" ry="3.8" transform="rotate(-15 12 12)"/></Icon>
