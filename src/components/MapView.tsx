"use client";

import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useState, useCallback } from "react";
import VenueMarker from "./VenueMarker";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "100%",
};

const lowerEastSideCenter = {
  lat: 40.7209,
  lng: -73.9844,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoom: 14,
};

interface Venue {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types?: string[];
}

export default function MapView() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError) {
    return (
      <div className="relative mx-4 mt-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-red-300 bg-red-50 shadow-inner">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <MapPin className="h-10 w-10" />
          <span className="text-sm font-medium">Map failed to load</span>
          <span className="text-xs text-red-400">
            Please check your API key configuration
          </span>
        </div>
      </div>
    );
  }

  const searchNearbyVenues = useCallback((mapInstance: google.maps.Map) => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    if (!center) return;

    const service = new google.maps.places.PlacesService(mapInstance);
    const request: google.maps.places.PlaceSearchRequest = {
      location: center,
      radius: 1500,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const filteredVenues = results
          .filter((place) => {
            const types = place.types || [];
            return (
              types.includes("bar") ||
              types.includes("restaurant") ||
              types.includes("night_club")
            );
          })
          .map((place) => ({
            id: place.place_id || "",
            name: place.name || "Unknown",
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
            rating: place.rating,
            types: place.types,
          }));

        setVenues(filteredVenues);
      }
    });
  }, []);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      searchNearbyVenues(mapInstance);
    },
    [searchNearbyVenues]
  );

  const onIdle = useCallback(() => {
    if (map) {
      searchNearbyVenues(map);
    }
  }, [map, searchNearbyVenues]);

  if (!isLoaded) {
    return (
      <div className="relative mx-4 mt-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-amber-50 shadow-inner">
        <div className="flex flex-col items-center gap-2 text-amber-400">
          <MapPin className="h-10 w-10 animate-pulse" />
          <span className="text-sm font-medium">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden rounded-2xl shadow-md">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={lowerEastSideCenter}
        options={mapOptions}
        onLoad={onLoad}
        onIdle={onIdle}
      >
        {venues.map((venue) => (
          <VenueMarker key={venue.id} venue={venue} />
        ))}
      </GoogleMap>
    </div>
  );
}
