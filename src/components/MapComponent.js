import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mapData from "../data.json";

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const detailRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [markerToCenter, setMarkerToCenter] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isMdScreen, setIsMdScreen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const adjustMapSize = useCallback(() => {
    if (!mapRef.current) return;

    const headerHeight = 64; // Height of the header
    const containerPadding = 64; // 32px on each side, consistent for all screen sizes

    let width, height;

    if (isMdScreen || !isDetailVisible) {
      // For wide screens or when no detail is shown, use full available space
      const availableHeight =
        windowSize.height - headerHeight - containerPadding;
      const availableWidth = windowSize.width - containerPadding;
      width = isDetailVisible
        ? Math.floor((availableWidth * 2) / 3)
        : availableWidth;
      height = availableHeight;
    } else {
      // For narrow screens with detail shown, use 16:9 ratio
      width = windowSize.width - containerPadding;
      height = (width * 9) / 16;
    }

    mapRef.current.style.width = `${width}px`;
    mapRef.current.style.height = `${height}px`;

    // Adjust detail component height to match map height on wide screens
    if (detailRef.current && isMdScreen) {
      detailRef.current.style.height = `${height}px`;
    }

    console.log(`Adjusted size - width: ${width}px, height: ${height}px`);
  }, [isMdScreen, isDetailVisible, windowSize]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newIsMdScreen = newWidth >= 768;

      setWindowSize({ width: newWidth, height: newHeight });

      if (newIsMdScreen !== isMdScreen) {
        setIsMdScreen(newIsMdScreen);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMdScreen]);

  useEffect(() => {
    adjustMapSize();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      if (markerToCenter) {
        mapInstanceRef.current.panTo(markerToCenter, { animate: true });
      }
    }
  }, [isDetailVisible, markerToCenter, isMdScreen, adjustMapSize, windowSize]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const { image, markers } = mapData;

    const customCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1, 0, 1, 0),
      project: function (latlng) {
        return new L.Point(latlng.lng, latlng.lat);
      },
      unproject: function (point) {
        return new L.LatLng(point.y, point.x);
      },
    });

    const bounds = [
      [image.coordinates.minY, image.coordinates.minX],
      [image.coordinates.maxY, image.coordinates.maxX],
    ];

    const mapInstance = L.map(mapRef.current, {
      crs: customCRS,
      minZoom: -2,
      maxZoom: 6,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      center: [0, 0],
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      attributionControl: false,
      // scrollWheelZoom: false, // Disable scroll wheel zoom
    });

    L.imageOverlay(image.src, bounds).addTo(mapInstance);
    mapInstance.fitBounds(bounds);

    markers.forEach((marker) => {
      const markerIcon = L.divIcon({
        className: "custom-icon",
        html: `<div class="bg-cyan-600 border-2 border-cyan-400 rounded-full w-8 h-8"></div>`,
      });

      const markerInstance = L.marker(
        [marker.coordinates.y, marker.coordinates.x],
        { icon: markerIcon }
      ).addTo(mapInstance);
      markerInstance.bindPopup(
        `<strong>${marker.title}</strong><br>${marker.description}`
      );

      markerInstance.on("click", () => {
        setIsDetailVisible(true);
        setSelectedMarker(marker);
        setMarkerToCenter([marker.coordinates.y, marker.coordinates.x]);
      });
    });

    mapInstance.on("mousemove", function (e) {
      const x = e.latlng.lng.toFixed(0);
      const y = e.latlng.lat.toFixed(0);
      setMousePosition({ x, y });
    });

    mapInstanceRef.current = mapInstance;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRestore = () => {
    setIsDetailVisible(false);
    setMarkerToCenter(null);
    setSelectedMarker(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] px-8 py-4 items-center justify-center md:space-x-4">
      <div
        className={`${
          isMdScreen && isDetailVisible ? "md:w-2/3" : "w-full"
        } flex items-center justify-center`}
      >
        <div
          ref={mapRef}
          className="rounded-2xl border border-gray-700 relative"
        >
          <div className="absolute bottom-2 left-2 p-2 bg-white bg-opacity-80 text-black rounded-lg shadow-lg z-[1000]">
            <div className="font-mono text-xs">
              <div>X: {mousePosition.x}</div>
              <div>Z: {mousePosition.y}</div>
            </div>
          </div>
        </div>
      </div>
      {isDetailVisible && selectedMarker && (
        <div
          ref={detailRef}
          className={`${
            isMdScreen ? "md:w-1/3" : "w-full"
          } mt-4 md:mt-0 flex flex-col`}
        >
          <div
            className={`flex-grow overflow-y-auto ${
              isMdScreen
                ? "border border-gray-700 shadow-lg rounded-lg bg-slate-800/90"
                : ""
            }`}
          >
            <div className="p-6">
              <div className="flex flex-row justify-between items-center border-b border-gray-600 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-100">
                  {selectedMarker.title}
                </h2>
                <button
                  onClick={handleRestore}
                  className="p-2 bg-gray-400 text-black rounded-lg shadow-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 z-[1000]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mb-4 text-gray-300">{selectedMarker.description}</p>
              <div className="flex flex-col gap-4">
                {selectedMarker.gallery.map((image, index) => (
                  <div key={index} className="flex flex-col items-center p-2">
                    <img
                      src={image.src}
                      alt={image.caption}
                      className="w-full h-auto rounded-lg shadow-xl transition-transform transform hover:scale-105 duration-300"
                    />
                    <span className="mt-2 text-center text-gray-400">
                      {image.caption}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
