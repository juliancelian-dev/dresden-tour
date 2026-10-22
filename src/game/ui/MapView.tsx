import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { Crosshair } from '@phosphor-icons/react'
import { FINISH, START } from '../../data/stations'
import type { StationState } from '../logic'

const pinIcon = (label: string, cls: string) =>
  L.divIcon({ className: '', html: `<div class="station-pin ${cls}">${label}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] })

const meIcon = L.divIcon({ className: '', html: '<div class="me-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] })

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    // The container animates in, so Leaflet measures it too early. Refit whenever its size settles.
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(points, { padding: [24, 24] })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(map.getContainer())
    const t = window.setTimeout(fit, 300)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
    // Only on mount, the route does not move
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

function Locate({ onPosition }: { onPosition: (p: [number, number] | null) => void }) {
  const map = useMap()
  const [watching, setWatching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!watching) return
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        onPosition(p)
        setError(null)
      },
      () => {
        setError('Standort nicht freigegeben')
        setWatching(false)
      },
      { enableHighAccuracy: true, maximumAge: 10000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [watching, onPosition])
  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-1">
      <button
        type="button"
        aria-label={watching ? 'Standort ausblenden' : 'Meinen Standort zeigen'}
        aria-pressed={watching}
        onClick={() => {
          if (!('geolocation' in navigator)) return setError('Kein GPS verfügbar')
          if (watching) onPosition(null)
          setWatching((w) => !w)
          map.getContainer().focus()
        }}
        className={`grid h-11 w-11 place-items-center rounded-full shadow-[var(--shadow)] transition-transform active:scale-95 ${watching ? 'bg-cobalt text-[#fff9f0]' : 'bg-surface text-ink'}`}
      >
        <Crosshair size={22} weight="bold" />
      </button>
      {error && <span className="rounded-full bg-surface px-2 py-1 text-xs shadow-[var(--shadow)]">{error}</span>}
    </div>
  )
}

export function MapView({ stations, nextId, onOpen }: { stations: StationState[]; nextId?: string; onOpen: (id: string) => void }) {
  const [me, setMe] = useState<[number, number] | null>(null)
  const route = useMemo<[number, number][]>(
    () => [[START.lat, START.lng], ...stations.map((s) => [s.station.lat, s.station.lng] as [number, number]), [FINISH.rooster.lat, FINISH.rooster.lng]],
    [stations],
  )
  return (
    <div className="relative h-[42svh] min-h-[260px] overflow-hidden rounded-3xl shadow-[var(--shadow)]">
      <MapContainer center={[51.0535, 13.737]} zoom={15} zoomControl={false} attributionControl className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <FitBounds points={route} />
        <Polyline positions={route} pathOptions={{ color: '#2e7d6b', weight: 4, dashArray: '2 8', lineCap: 'round' }} />
        <Marker position={[START.lat, START.lng]} icon={pinIcon('H', 'is-done')} title="Jugendherberge" />
        <Marker position={[FINISH.rooster.lat, FINISH.rooster.lng]} icon={pinIcon('B', '')} title="Red Rooster" />
        {stations.map((s) => (
          <Marker
            key={s.station.id}
            position={[s.station.lat, s.station.lng]}
            icon={pinIcon(String(s.index + 1), s.done ? 'is-done' : s.station.id === nextId ? 'is-next' : '')}
            title={s.station.name}
            eventHandlers={{ click: () => onOpen(s.station.id) }}
          />
        ))}
        {me && <Marker position={me} icon={meIcon} title="Du" />}
        <Locate onPosition={setMe} />
      </MapContainer>
    </div>
  )
}
