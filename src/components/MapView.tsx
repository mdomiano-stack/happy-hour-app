"use client";

import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import VenueMarker from "./VenueMarker";
import SearchAreaButton from "./SearchAreaButton";

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
  mapId: "92eae0b63bdbc2f58caa19c5",
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
  const [mapIsDirty, setMapIsDirty] = useState(false);
  const [lastSearchCenter, setLastSearchCenter] = useState<google.maps.LatLng | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    const searchTypes = ["bar", "restaurant", "night_club", "brewery"];
    const allResults: Venue[] = [];
    let completedSearches = 0;
    const totalSearches = searchTypes.length;

    const fetchPage = (
      type: string,
      pageToken?: string,
      accumulatedResults: Venue[] = []
    ) => {
      const request: any = {
        location: center,
        type: type,
        rankBy: google.maps.places.RankBy.DISTANCE,
      };

      if (pageToken) {
        request.pageToken = pageToken;
      }

      service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const venues = results.map((place) => ({
            id: place.place_id || "",
            name: place.name || "Unknown",
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
            rating: place.rating,
            types: place.types,
          }));
          
          const combined = [...accumulatedResults, ...venues];

          if (pagination?.hasNextPage && combined.length < 60) {
            setTimeout(() => {
              fetchPage(type, (pagination as any).nextPageToken, combined);
            }, 2000);
          } else {
            allResults.push(...combined);
            completedSearches++;

            if (completedSearches === totalSearches) {
              const uniqueVenues = Array.from(
                new Map(allResults.map((v) => [v.id, v])).values()
              );
              console.log(`Found ${uniqueVenues.length} unique venues across ${totalSearches} types`);
              setVenues(uniqueVenues);
            }
          }
        } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn(`Places API error for type ${type}:`, status);
          completedSearches++;

          if (completedSearches === totalSearches) {
            const uniqueVenues = Array.from(
              new Map(allResults.map((v) => [v.id, v])).values()
            );
            console.log(`Found ${uniqueVenues.length} unique venues across ${totalSearches} types`);
            setVenues(uniqueVenues);
          }
        } else {
          completedSearches++;

          if (completedSearches === totalSearches) {
            const uniqueVenues = Array.from(
              new Map(allResults.map((v) => [v.id, v])).values()
            );
            console.log(`Found ${uniqueVenues.length} unique venues across ${totalSearches} types`);
            setVenues(uniqueVenues);
          }
        }
      });
    };

    searchTypes.forEach((type) => {
      fetchPage(type);
    });
  }, []);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      const center = mapInstance.getCenter();
      if (center) {
        setLastSearchCenter(center);
      }
      searchNearbyVenues(mapInstance);
    },
    [searchNearbyVenues]
  );

  const onCenterChanged = useCallback(() => {
    if (map && lastSearchCenter) {
      const currentCenter = map.getCenter();
      if (currentCenter && !currentCenter.equals(lastSearchCenter)) {
        setMapIsDirty(true);
      }
    }
  }, [map, lastSearchCenter]);

  const handleSearchArea = useCallback(() => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        setLastSearchCenter(center);
      }
      searchNearbyVenues(map);
      setMapIsDirty(false);
    }
  }, [map, searchNearbyVenues]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
        onCenterChanged={onCenterChanged}
      >
        {venues.map((venue) => (
          <VenueMarker
            key={venue.id}
            venue={venue}
            isSelected={selectedVenueId === venue.id}
            onSelect={() => setSelectedVenueId(venue.id)}
            onClose={() => setSelectedVenueId(null)}
          />
        ))}
      </GoogleMap>
      {mapIsDirty && <SearchAreaButton onClick={handleSearchArea} />}
    </div>
  );
}
