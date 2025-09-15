import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AnimalReport } from "@shared/schema";
import AnimalDetailModal from "./animal-detail-modal";

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  filters: { tipo: string; raca: string };
}

export default function MapView({ filters }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalReport | null>(null);

  const { data: animals } = useQuery<AnimalReport[]>({
    queryKey: ['/api/reports', filters.tipo !== 'all' ? filters.tipo : undefined, filters.raca !== 'all' ? filters.raca : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.tipo && filters.tipo !== 'all') {
        params.append('tipo', filters.tipo);
      }
      if (filters.raca && filters.raca !== 'all') {
        params.append('raca', filters.raca);
      }
      
      const response = await fetch(`/api/reports?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch animal reports');
      }
      
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-23.5505, -46.6333], // São Paulo coordinates
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create markers layer
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Try to get user location and center map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          
          // Add user location marker
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })
          }).addTo(map).bindPopup('Sua localização');
        },
        (error) => {
          console.warn('Geolocation failed:', error);
        }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when animals data changes
  useEffect(() => {
    if (!markersLayerRef.current || !animals) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add markers for each animal
    animals.forEach((animal) => {
      const animalTypeIcon = animal.animalTipo === 'Cão' ? '🐕' : 
                            animal.animalTipo === 'Gato' ? '🐱' : '🐾';

      const marker = L.marker([animal.latitude, animal.longitude], {
        icon: L.divIcon({
          className: 'custom-animal-marker',
          html: `<div class="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" data-testid="marker-animal-${animal.id}">${animalTypeIcon}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
      });

      marker.on('click', () => {
        setSelectedAnimal(animal);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [animals]);

  return (
    <>
      <div 
        ref={mapRef} 
        className="h-[calc(100vh-8rem)] w-full"
        data-testid="map-container"
      />
      
      {selectedAnimal && (
        <AnimalDetailModal 
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </>
  );
}
