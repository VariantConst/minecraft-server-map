import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapData from '../data.json';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHalfWidth, setIsHalfWidth] = useState(false);
  const [markerToCenter, setMarkerToCenter] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 清理之前的地图实例
    if (map) {
      map.remove();
    }

    const { image, markers } = mapData;

    // Define a custom CRS where y-axis is inverted
    const customCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1, 0, 1, 0), // Normal transformation for x and y
      project: function (latlng) {
        return new L.Point(latlng.lng, latlng.lat);
      },
      unproject: function (point) {
        return new L.LatLng(point.y, point.x);
      }
    });

    const bounds = [
      [image.coordinates.minY, image.coordinates.minX],
      [image.coordinates.maxY, image.coordinates.maxX],
    ];

    // 计算合适的最小缩放级别以确保地图能够撑满页面
    const padding = 32; // Tailwind CSS 'p-8' 等于 2rem，每 rem 通常为 16px
    const mapWidth = mapRef.current.clientWidth + padding * 2;
    const mapHeight = mapRef.current.clientHeight + padding * 2;
    const imageWidth = image.coordinates.maxX - image.coordinates.minX;
    const imageHeight = image.coordinates.maxY - image.coordinates.minY;
    const minZoomX = Math.log2(mapWidth / imageWidth);
    const minZoomY = Math.log2(mapHeight / imageHeight);
    const minZoom = Math.min(minZoomX, minZoomY);

    const mapInstance = L.map(mapRef.current, {
      crs: customCRS,
      minZoom: minZoom,
      maxZoom: 20,
      zoomSnap: 0.1, // 设置缩放步长为 0.1
      zoomDelta: 0.1, // 设置鼠标滚轮或键盘缩放步长为 0.1
      zoom: minZoom, // 设置初始缩放等级
      center: [0, 0], // 设置初始中心点
      maxBounds: bounds, // 设置最大边界
      maxBoundsViscosity: 1.0, // 防止拖动超出边界
      attributionControl: false // 禁用右下角的 Leaflet 标志
    });

    const imageLayer = L.imageOverlay(image.src, bounds).addTo(mapInstance);
    mapInstance.fitBounds(bounds);

    markers.forEach(marker => {
      const markerIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div class="bg-red-500 rounded-full w-4 h-4"></div>`,
      });

      const markerInstance = L.marker([marker.coordinates.y, marker.coordinates.x], { icon: markerIcon }).addTo(mapInstance);
      markerInstance.bindPopup(`<strong>${marker.title}</strong><br>${marker.description}`);

      markerInstance.on('click', () => {
        setIsHalfWidth(true);
        setMarkerToCenter([marker.coordinates.y, marker.coordinates.x]);
        setSelectedMarker(marker);
      });
    });

    mapInstance.on('mousemove', function (e) {
      const x = e.latlng.lng.toFixed(0);
      const y = e.latlng.lat.toFixed(0);
      setMousePosition({ x, y });
    });

    setMap(mapInstance);
  }, [mapRef]);

  useEffect(() => {
    if (map) {
      map.invalidateSize();
      if (markerToCenter) {
        map.panTo(markerToCenter, { animate: true });
      }
    }
  }, [isHalfWidth, map, markerToCenter]);

  const handleRestore = () => {
    setIsHalfWidth(false);
    setMarkerToCenter(null);
    setSelectedMarker(null);
  };

  return (
    <div className="flex h-screen p-8">
      <div className={`relative ${isHalfWidth ? 'w-2/3' : 'w-full'} rounded-lg border-2 border-gray-300 shadow-lg`}>
        <div ref={mapRef} className="h-full w-full rounded-lg" />
        <div className="absolute bottom-0 left-0 m-4 p-2 bg-white bg-opacity-80 text-black rounded-lg shadow-lg z-[1000]">
          <div className="font-mono text-xs">
            <div>X: {mousePosition.x}</div>
            <div>Z: {mousePosition.y}</div>
          </div>
        </div>
      </div>
      {isHalfWidth && selectedMarker && (
        <div className="w-1/3 p-4 overflow-auto m-4">
          
          <div>
            <div className='flex flex-row justify-between'>
              <h2 className="text-2xl font-bold mb-4">{selectedMarker.title}</h2>
              <button
                onClick={handleRestore}
                className="mb-4 p-2 bg-blue-500 text-white rounded-lg shadow-lg z-[1000]"
              >
                恢复
              </button>
            </div>
            <p className="mb-4">{selectedMarker.description}</p>
            <div className="flex flex-col gap-12">
              {selectedMarker.gallery.map((image, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img src={image.src} alt={image.caption} className="w-full h-auto rounded-lg shadow-lg" />
                  <span className="mt-2 text-center">{image.caption}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
