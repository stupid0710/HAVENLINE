'use client';

declare const google: any;

import React, { useEffect, useState } from 'react';
import { Hospital, MOCK_USER_COORDINATES } from '../lib/mockDatabase';
import { MapPin, Navigation, Compass, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface GoogleMapProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  userLocation: { lat: number; lng: number };
  onSelectHospital?: (hospital: Hospital) => void;
}

export default function GoogleMap({
  hospitals,
  selectedHospital,
  userLocation,
  onSelectHospital
}: GoogleMapProps) {
  const [zoom, setZoom] = useState(13);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if public maps key is available in environment
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // Bypasses loading if key is missing, empty, or a standard placeholder string
    if (key && key.trim() !== '' && !key.toLowerCase().includes('placeholder') && !key.toLowerCase().includes('your_api_key')) {
      setUseGoogleMaps(true);

      const handleLoaded = () => setIsLoaded(true);

      if ((window as any).google) {
        setIsLoaded(true);
      } else {
        window.addEventListener('google-maps-loaded', handleLoaded);

        const scriptId = 'google-maps-script-tag';
        const existingScript = document.getElementById(scriptId);

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry,places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setIsLoaded(true);
            window.dispatchEvent(new Event('google-maps-loaded'));
          };
          script.onerror = () => {
            console.warn('Failed to load Google Maps script. Falling back to local grid simulator.');
            setUseGoogleMaps(false);
            setIsLoaded(true);
          };
          document.head.appendChild(script);
        }
      }

      return () => {
        window.removeEventListener('google-maps-loaded', handleLoaded);
      };
    } else {
      setUseGoogleMaps(false);
      setIsLoaded(true); // fall back to premium simulator
    }
  }, []);


  // Google Maps active rendering
  useEffect(() => {
    if (useGoogleMaps && isLoaded && (window as any).google) {
      const mapOptions = {
        center: userLocation,
        zoom: zoom,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#060608' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#060608' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#74747c' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#a0a0ac' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#74747c' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#0a100c' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#16161e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#0c0c10' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#74747c' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#1e1e28' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#121218' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#383844' }]
          }
        ]
      };

      const mapElement = document.getElementById('google-map-canvas');
      if (mapElement) {
        const map = new google.maps.Map(mapElement, mapOptions);

        // Add user marker
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#00E5FF',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Add hospital markers
        hospitals.forEach((h) => {
          const marker = new google.maps.Marker({
            position: { lat: h.lat, lng: h.lng },
            map: map,
            title: h.name,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: selectedHospital?.id === h.id ? '#00E676' : '#ef4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 1.5
            }
          });

          marker.addListener('click', () => {
            if (onSelectHospital) onSelectHospital(h);
          });
        });
      }
    }
  }, [useGoogleMaps, isLoaded, hospitals, selectedHospital, zoom, userLocation]);

  // Handle local simulator grid coordinate mapping
  // Map lat/lng coordinates to a local 100x100 relative view bounding box
  const getSimCoords = (lat: number, lng: number) => {
    // Determine the min/max bounding range of all mapped nodes dynamically
    const lats = [userLocation.lat, ...hospitals.map(h => h.lat)];
    const lngs = [userLocation.lng, ...hospitals.map(h => h.lng)];

    const minLat = Math.min(...lats) - 0.03;
    const maxLat = Math.max(...lats) + 0.03;
    const minLng = Math.min(...lngs) - 0.03;
    const maxLng = Math.max(...lngs) + 0.03;

    const latRange = maxLat - minLat || 0.1;
    const lngRange = maxLng - minLng || 0.1;

    const x = ((lng - minLng) / lngRange) * 100;
    const y = 100 - ((lat - minLat) / latRange) * 100; // Invert Y for screen coords
    return { x, y };
  };

  const userSim = getSimCoords(userLocation.lat, userLocation.lng);
  const selectedSim = selectedHospital ? getSimCoords(selectedHospital.lat, selectedHospital.lng) : null;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#060608] flex flex-col">
      {useGoogleMaps ? (
        // Active Google Map Container
        <div id="google-map-canvas" className="w-full h-full min-h-[300px] flex-1" />
      ) : (
        // Premium Google Maps Simulator (vector rendering)
        <div className="w-full h-full min-h-[350px] flex-1 relative bg-[#060608] select-none overflow-hidden font-mono">
          
          {/* Simulated grid streets vector backdrop */}
          <svg className="absolute inset-0 w-full h-full text-slate-800/20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sim_grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sim_grid)" />
            
            {/* Primary highway representations */}
            <path d="M 0,20 L 1000,50" fill="none" stroke="#121216" strokeWidth="12" />
            <path d="M 0,20 L 1000,50" fill="none" stroke="#1c1c24" strokeWidth="8" />
            
            <path d="M 50,0 L 80,1000" fill="none" stroke="#121216" strokeWidth="10" />
            <path d="M 50,0 L 80,1000" fill="none" stroke="#1c1c24" strokeWidth="6" />

            <path d="M 0,150 L 1000,180" fill="none" stroke="#121216" strokeWidth="8" />
            <path d="M 0,150 L 1000,180" fill="none" stroke="#1c1c24" strokeWidth="4" />

            <path d="M 250,0 L 280,1000" fill="none" stroke="#121216" strokeWidth="8" />
            <path d="M 250,0 L 280,1000" fill="none" stroke="#1c1c24" strokeWidth="4" />

            <path d="M 0,320 Q 300,280 1000,340" fill="none" stroke="#000" strokeWidth="12" />
            <path d="M 0,320 Q 300,280 1000,340" fill="none" stroke="#121216" strokeWidth="6" />

            {/* Active directions path router */}
            {selectedSim && (
              <g>
                <path
                  d={`M ${userSim.x}%,${userSim.y}% L ${selectedSim.x}%,${selectedSim.y}%`}
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-45"
                />
                <path
                  d={`M ${userSim.x}%,${userSim.y}% L ${selectedSim.x}%,${selectedSim.y}%`}
                  fill="none"
                  stroke="#00ff80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6,4"
                  style={{ animation: 'dash 1.5s linear infinite' }}
                />
              </g>
            )}
          </svg>

          {/* User Location Node */}
          <div 
            style={{ left: `${userSim.x}%`, top: `${userSim.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          >
            <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center shadow-lg shadow-[#00E5FF]/10 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            </span>
            <span className="text-[8px] bg-black/90 border border-white/5 text-white rounded-md px-1.5 py-0.5 mt-1 font-bold shadow-md whitespace-nowrap">
              MY_LOC
            </span>
          </div>

          {/* Hospital Location pins */}
          {hospitals.map((h) => {
            const sim = getSimCoords(h.lat, h.lng);
            const active = selectedHospital?.id === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onSelectHospital && onSelectHospital(h)}
                style={{ left: `${sim.x}%`, top: `${sim.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group transition-all"
              >
                <div 
                  className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-[#00E676] border-[#00E676] text-black scale-110 shadow-[0_0_15px_rgba(0,230,118,0.4)]' 
                      : 'bg-[#0F0F11] border-white/5 text-[#00E5FF] hover:scale-105'
                  }`}
                >
                  <MapPin size={active ? 14 : 12} fill="currentColor" fillOpacity={active ? 0.3 : 0.1} />
                </div>
                <span 
                  className={`text-[8px] rounded-md px-1.5 py-0.5 mt-1 font-bold shadow-md whitespace-nowrap border transition-all ${
                    active 
                      ? 'bg-white border-white text-black font-extrabold' 
                      : 'bg-black/90 border-white/5 text-slate-400 opacity-60 group-hover:opacity-100'
                  }`}
                >
                  {h.name.split(' ')[0].toUpperCase()}
                </span>
              </button>
            );
          })}

          {/* Traffic/Navigation Control overlays */}
          <div className="absolute top-3 left-3 bg-[#0C0C0E]/95 backdrop-blur border border-white/5 rounded-xl p-3 shadow-lg flex items-center gap-3 z-30 font-mono text-[9px]">
            <Compass className="text-[#00E676] animate-spin-slow" size={14} />
            <div className="leading-tight">
              <p className="font-extrabold text-white">MAP_SIMULATOR</p>
              <p className="text-slate-500">GRID_NAV_ACTIVE</p>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-30">
            <button
              onClick={() => setZoom(z => Math.min(18, z + 1))}
              className="p-2 rounded-lg border border-white/5 bg-[#0F0F11] text-slate-400 hover:text-white transition-all shadow-sm"
            >
              <ZoomIn size={12} />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(10, z - 1))}
              className="p-2 rounded-lg border border-white/5 bg-[#0F0F11] text-slate-400 hover:text-white transition-all shadow-sm"
            >
              <ZoomOut size={12} />
            </button>
          </div>

          {/* Alert explaining Fallback status */}
          <div className="absolute bottom-3 left-3 bg-black/95 border border-white/5 text-slate-400 px-2.5 py-1.5 rounded-lg text-[8px] flex items-center gap-1.5 z-30 shadow-md">
            <AlertCircle size={10} className="text-[#00E676]" />
            <span>LOCAL GRID GRAPHICS ACTIVE</span>
          </div>

          {/* Inline animation styles for route lines */}
          <style jsx global>{`
            @keyframes dash {
              to {
                stroke-dashoffset: -20;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
