"use client";

import { Marker, InfoWindow } from "@react-google-maps/api";
import { Star, MapPin } from "lucide-react";

interface VenueMarkerProps {
  venue: {
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    rating?: number;
    types?: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export default function VenueMarker({ venue, isSelected, onSelect, onClose }: VenueMarkerProps) {

  const customIcon = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#f59e0b",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 22),
  };

  return (
    <>
      <Marker
        position={venue.location}
        icon={customIcon}
        onClick={onSelect}
        title={venue.name}
      />
      {isSelected && (
        <InfoWindow
          position={venue.location}
          onCloseClick={onClose}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-gray-800 mb-1">{venue.name}</h3>
            {venue.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-700">{venue.rating}</span>
              </div>
            )}
            <button className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600 active:scale-95">
              <MapPin className="h-4 w-4" />
              View Happy Hours
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
