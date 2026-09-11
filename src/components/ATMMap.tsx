import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ATMItem } from '../types';
import { translations } from '../i18n';
import { Locate, Navigation, Banknote, Clock, CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';

interface ATMMapProps {
  atms: ATMItem[];
  selectedAtm: ATMItem | null;
  onSelectAtm: (atm: ATMItem) => void;
  userLocation: { lat: number; lng: number } | null;
  onCenterUser: () => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
  theme: string;
}

export const ATMMap: React.FC<ATMMapProps> = ({
  atms,
  selectedAtm,
  onSelectAtm,
  userLocation,
  onCenterUser,
  lang,
  theme,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const t = translations[lang];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat ?? -8.825;
      const initialLng = userLocation?.lng ?? 13.235;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer: CartoDB Voyager or Dark Matter based on theme
      const tileUrl =
        theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]);

  // Update tiles when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    // Find existing tile layer and replace
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; CARTO & OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
  }, [theme]);

  // Render User Location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip(t.nearestBadge, { permanent: false, direction: 'top' });
    }
  }, [userLocation, t.nearestBadge]);

  // Render ATM Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    Object.keys(markersRef.current).forEach((key) => {
      markersRef.current[key]?.remove();
    });
    markersRef.current = {};

    atms.forEach((atm) => {
      let pinColor = '#059669'; // Green
      let statusLabel = t.cashAvailable;
      let statusIconSvg = '✓';

      if (atm.status === 'low_cash') {
        pinColor = '#d97706'; // Amber
        statusLabel = t.lowCash;
        statusIconSvg = '!';
      } else if (atm.status === 'out_of_cash') {
        pinColor = '#dc2626'; // Red
        statusLabel = t.outOfCash;
        statusIconSvg = '✕';
      } else if (atm.status === 'maintenance') {
        pinColor = '#6b7280'; // Gray
        statusLabel = t.inMaintenance;
        statusIconSvg = '⚙';
      }

      const isSelected = selectedAtm?.id === atm.id;
      const markerSize = isSelected ? 42 : 36;

      const markerHtml = `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background: ${pinColor};
          border: 2.5px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.95)'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) ${isSelected ? 'scale(1.15)' : ''};
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          cursor: pointer;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-weight: 800;
            font-size: ${isSelected ? '14px' : '12px'};
            line-height: 1;
          ">${statusIconSvg}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `atm-marker-${atm.id}`,
        html: markerHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize],
      });

      const marker = L.marker([atm.lat, atm.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: ${atm.bankColor}; background: ${atm.bankColor}15; padding: 2px 6px; border-radius: 4px;">
              ${atm.bankCode}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${pinColor}; display: flex; align-items: center; gap: 4px;">
              ● ${statusLabel}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #111827;">${atm.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280; line-height: 1.3;">${atm.address}</p>
          
          <div style="display: flex; gap: 8px; font-size: 11px; color: #374151; margin-bottom: 10px; background: #f3f4f6; padding: 6px; border-radius: 6px;">
            <div><strong>${atm.availableDenominations.length > 0 ? atm.availableDenominations.join(', ') + ' Kz' : 'Sem notas'}</strong></div>
            <div>• Fila: <strong>${atm.queueWaitMinutes} min</strong></div>
          </div>

          <button id="popup-btn-${atm.id}" style="
            width: 100%;
            background: #047857;
            color: #ffffff;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            ${t.details} &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -markerSize / 2] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${atm.id}`);
        if (btn) {
          btn.onclick = () => onSelectAtm(atm);
        }
      });

      marker.on('click', () => {
        onSelectAtm(atm);
      });

      markersRef.current[atm.id] = marker;
    });
  }, [atms, selectedAtm, onSelectAtm, t]);

  // Center on selected ATM if changed
  useEffect(() => {
    if (selectedAtm && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedAtm.lat, selectedAtm.lng], 15, {
        duration: 0.8,
      });
      const targetMarker = markersRef.current[selectedAtm.id];
      if (targetMarker && !targetMarker.isPopupOpen()) {
        targetMarker.openPopup();
      }
    }
  }, [selectedAtm]);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        <button
          id="btn-locate-me"
          onClick={onCenterUser}
          title={t.locateMe}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-xs border border-slate-200 dark:border-slate-700"
        >
          <Locate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">{t.locateMe}</span>
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>{t.cashAvailable}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>{t.lowCash}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>{t.outOfCash}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>{t.inMaintenance}</span>
        </div>
      </div>
    </div>
  );
};
