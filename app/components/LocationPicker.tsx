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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map)

    let marker: any = null

    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng
      setSelectedLat(lat)
      setSelectedLng(lng)
      if (marker) marker.setLatLng([lat, lng])
      else marker = L.marker([lat, lng]).addTo(map)
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15)
          if (marker) marker.setLatLng([pos.coords.latitude, pos.coords.longitude])
          else marker = L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
          setSelectedLat(pos.coords.latitude)
          setSelectedLng(pos.coords.longitude)
          setAddress('Current Location')
        },
        () => {}
      )
    }

    return () => map.remove()
  }, [mapLoaded])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>📍 Choose Delivery Location</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>
      <div ref={mapRef} style={{ flex: 1 }} />
      <div style={{ backgroundColor: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {selectedLat && <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{searching ? 'Getting address...' : address}</p>}
        <button onClick={() => { if (selectedLat && selectedLng) onLocationSelected({ lat: selectedLat, lng: selectedLng, address }) }}
          disabled={!selectedLat}
          style={{ padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', backgroundColor: selectedLat ? '#e33124' : '#ddd', color: selectedLat ? 'white' : '#999' }}>
          {selectedLat ? '✅ Confirm This Location' : '📌 Tap on the map to choose location'}
        </button>
      </div>
    </div>
  )
}