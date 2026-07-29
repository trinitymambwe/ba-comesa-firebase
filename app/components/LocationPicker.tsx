'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onLocationSelected: (data: { lat: number; lng: number; address: string }) => void
  onClose: () => void
}

export default function LocationPicker({ onLocationSelected, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
    script.onload = () => setMapLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current).setView([-15.4082, 28.2871], 13)

    // 🔥 Professional dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Custom pulsing marker
    const pulsingIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="
            position: absolute; top: -12px; left: -12px;
            width: 24px; height: 24px;
            border-radius: 50%;
            background: rgba(227, 49, 36, 0.4);
            animation: pulse-ring 2s ease-out infinite;
          "></div>
          <div style="
            position: absolute; top: -4px; left: -4px;
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #e33124;
            box-shadow: 0 0 10px rgba(227, 49, 36, 0.6);
          "></div>
        </div>
        <style>
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    })

    let marker: any = null

    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng
      setSelectedLat(lat)
      setSelectedLng(lng)
      if (marker) map.removeLayer(marker)
      marker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(map)

      setSearching(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        const data = await res.json()
        setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      } catch {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
      setSearching(false)
    })

    // Try to center on user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          map.setView([lat, lng], 15)
          if (marker) map.removeLayer(marker)
          marker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(map)
          setSelectedLat(lat)
          setSelectedLng(lng)
          setAddress('Current Location')
        },
        () => {}
      )
    }

    return () => map.remove()
  }, [mapLoaded])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#1a1a2e', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e33124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Choose Delivery Location
        </span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}>✕</button>
      </div>
      <div ref={mapRef} style={{ flex: 1 }} />
      <div style={{ backgroundColor: '#1a1a2e', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {selectedLat && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {searching ? 'Getting address...' : address}
          </p>
        )}
        <button
          onClick={() => {
            if (selectedLat && selectedLng) onLocationSelected({ lat: selectedLat, lng: selectedLng, address })
          }}
          disabled={!selectedLat}
          style={{
            padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
            backgroundColor: selectedLat ? '#e33124' : 'rgba(255,255,255,0.1)', color: selectedLat ? 'white' : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {selectedLat ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Confirm Location</>
          ) : (
            '📌 Tap on the map to drop a pin'
          )}
        </button>
      </div>
    </div>
  )
}