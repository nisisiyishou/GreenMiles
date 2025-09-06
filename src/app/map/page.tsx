'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api'

export default function SimpleWalkingRoute() {
  const { isLoaded } = useLoadScript({
    id: 'directions-api',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
    region: 'US',
    language: 'en',
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [dirResult, setDirResult] = useState<google.maps.DirectionsResult | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [busy, setBusy] = useState(false)

  const defaultCenter = { lat: -33.8960, lng: 151.2743 }

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    let lastPos: { lat: number; lng: number } | null = null
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        if (pos.coords && pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading)
        } else if (lastPos) {
          const dy = pos.coords.latitude - lastPos.lat
          const dx = pos.coords.longitude - lastPos.lng
          if (Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6) {
            const bearing = (Math.atan2(dy, dx) * 180) / Math.PI
            setHeading((bearing + 90 + 360) % 360)
          }
        }
        lastPos = p
        if (mapRef.current) mapRef.current.panTo(p)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  const startRoute = async () => {
    if (!mapRef.current) return
    setBusy(true)
    try {
      const g = (window as any).google as typeof google
      const service = new g.maps.DirectionsService()
      const res = await service.route({
        origin: { lat: -33.8960, lng: 151.2743 }, // Bondi Icebergs
        destination: { lat: -33.9030, lng: 151.2630 }, // Bronte Park
        waypoints: [
          { location: { lat: -33.8975, lng: 151.2775 } }, // Bondi to Mackenzies path
          { location: { lat: -33.8990, lng: 151.2800 } }, // Mackenzies Bay
          { location: { lat: -33.9015, lng: 151.2720 } }, // Tamarama Beach area
        ],
        travelMode: g.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      })

      setDirResult(res)
      setNavigating(true)
      const bounds = new g.maps.LatLngBounds()
      res.routes[0].overview_path.forEach(ll => bounds.extend(ll))
      mapRef.current!.fitBounds(bounds, 48)
    } finally {
      setBusy(false)
    }
  }

  const clearRoute = () => {
    setDirResult(null)
    setNavigating(false)
  }

  const mapOptions: google.maps.MapOptions = {
    gestureHandling: 'greedy',
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ],
  }

  let userIcon: google.maps.Symbol | undefined
  if (isLoaded && userPos) {
    const g = (window as any).google as typeof google
    userIcon = {
      path: "M 0 -1 L 1 1 L -1 1 z",
      scale: 8,
      rotation: heading ?? 0,
      fillColor: '#1E88E5',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      anchor: new g.maps.Point(0, 0),
    } as google.maps.Symbol
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button
          type="button"
          onClick={() => (navigating ? clearRoute() : startRoute())}
          disabled={busy || !isLoaded}
          className="px-4 py-2 rounded-xl shadow-sm bg-emerald-500 text-white font-medium hover:brightness-95 disabled:opacity-60"
        >
          {navigating ? 'Clear Route' : (busy ? 'Loading...' : 'Start Walking Route')}
        </button>
      </div>

      {isLoaded && (
        <GoogleMap
          mapContainerClassName="w-full flex-grow"
          center={userPos ?? defaultCenter}
          zoom={15}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                  setUserPos(p)
                  map.panTo(p)
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
              )
            }
          }}
        >
          {dirResult && (
            <DirectionsRenderer
              options={{
                directions: dirResult,
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                  strokeColor: '#6666ff',
                  strokeOpacity: 0.7,
                  strokeWeight: 10,
                },
              }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  )
}