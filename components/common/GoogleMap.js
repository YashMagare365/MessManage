"use client";
import { useState, useEffect } from "react";

const GoogleMap = ({
  center = { lat: 28.6139, lng: 77.209 }, // Default to Delhi
  zoom = 13,
  markers = [],
  height = "400px",
  className = "",
}) => {
  const [map, setMap] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google) {
        setGoogleMaps(window.google);
        return;
      }

      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setMapError("Google Maps API key not configured");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          setGoogleMaps(window.google);
        } else {
          setMapError("Failed to load Google Maps");
        }
      };
      script.onerror = () => setMapError("Failed to load Google Maps script");
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!googleMaps || !document.getElementById("map")) return;

    try {
      const mapInstance = new googleMaps.maps.Map(
        document.getElementById("map"),
        {
          center,
          zoom,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#f5f5f5" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#616161" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#f5f5f5" }],
            },
          ],
        }
      );

      setMap(mapInstance);

      // Add markers
      markers.forEach((marker) => {
        new googleMaps.maps.Marker({
          position: marker.position,
          map: mapInstance,
          title: marker.title,
          icon: marker.icon,
          animation: googleMaps.maps.Animation.DROP,
        });
      });

      // Fit bounds to show all markers
      if (markers.length > 0) {
        const bounds = new googleMaps.maps.LatLngBounds();
        markers.forEach((marker) => bounds.extend(marker.position));
        mapInstance.fitBounds(bounds, { padding: 20 });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Error initializing map");
    }
  }, [googleMaps, center, zoom, markers]);

  if (mapError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-red-600">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-sm">{mapError}</p>
          <p className="text-xs mt-1">
            Please check your Google Maps API configuration
          </p>
        </div>
      </div>
    );
  }

  if (!googleMaps) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return <div id="map" className={className} style={{ height }} />;
};

export default GoogleMap;
