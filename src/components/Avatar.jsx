import { useMemo, useState } from 'react'

function initials(name = '?') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?'
}

function fallbackAvatar(name, size = 96) {
  const text = initials(name)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#38e3c1"/><stop offset="1" stop-color="#159fce"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${size / 2}" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size / 2.7}" font-weight="700" fill="#06121f">${text}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function Avatar({ src, name, className = '', ...props }) {
  const fallback = useMemo(() => fallbackAvatar(name), [name])
  const [failed, setFailed] = useState(false)
  return <img src={failed ? fallback : (src || fallback)} onError={() => setFailed(true)} alt={props.alt || name || 'Аватар'} className={className} {...props} />
}
