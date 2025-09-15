'use client';

import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  address?: string;
  className?: string;
}

const MapComponent: React.FC<{ address: string }> = ({ address }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 15,
        styles: [
          // Dark theme for the map
          { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#f3f4f6" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d1d5db" }]
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d1d5db" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#374151" }]
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca3af" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#374151" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2937" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca3af" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#4b5563" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2937" }]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3f4f6" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#374151" }]
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d1d5db" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f172a" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca3af" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0f172a" }]
          }
        ]
      });
      setMap(newMap);
      setGeocoder(new google.maps.Geocoder());
    }
  }, [ref, map]);

  useEffect(() => {
    if (map && geocoder && address) {
      geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);

          // Add a marker
          new google.maps.Marker({
            position: location,
            map: map,
            title: address,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#f59e0b', // Amber color to match our theme
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8
            }
          });
        }
      });
    }
  }, [map, geocoder, address]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <p className="text-sm text-slate-400">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
          <div className="text-center">
            <MapPinIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Failed to load map</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center h-full bg-slate-800 rounded-xl">
          <div className="text-center">
            <MapPinIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        </div>
      );
  }
};

export const GoogleMap: React.FC<GoogleMapProps> = ({
  address = "New York, NY",
  className = "w-full h-64"
}) => {
  // You'll need to add your Google Maps API key here
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Don't attempt to load Google Maps if no API key is provided
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className={`${className} bg-slate-800 rounded-xl flex items-center justify-center`}>
        <div className="text-center">
          <MapPinIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Maps not configured</p>
          <p className="text-xs text-slate-500">
            {process.env.NODE_ENV === 'development' 
              ? 'Add Google Maps API key to enable' 
              : 'Contact support for map functionality'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent address={address} />
      </Wrapper>
    </div>
  );
};

export default GoogleMap;
