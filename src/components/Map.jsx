import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Map({
  mode,
  profile,
  isFinished,
  isViewMode,
  setIsFinished,
  waypoints,
  setWaypoints,
  setRedoStack,
  onDistanceChange,
  resetKey,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const animFrameRef = useRef(null);

  // Estado para garantizar que el mapa y sus capas existan antes de dibujar
  const [mapLoaded, setMapLoaded] = useState(false);

  const onDistanceChangeRef = useRef(onDistanceChange);
  useEffect(() => {
    onDistanceChangeRef.current = onDistanceChange;
  }, [onDistanceChange]);

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-99.1332, 19.4326],
      zoom: 13,
      doubleClickZoom: false,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
    });
    map.addControl(draw);

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      if (!map.getSource('route-source')) {
        map.addSource('route-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#38bdf8',
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });
      }
      setMapLoaded(true); // Indica que las fuentes y capas ya están registradas
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Captura de clics en el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isFinished || isViewMode) return;
      const newPoint = [e.lngLat.lng, e.lngLat.lat];
      setRedoStack([]);
      setWaypoints((prev) => [...prev, newPoint]);
    };

    const handleMapDblClick = (e) => {
      if (!isFinished && !isViewMode && waypoints.length >= 2) {
        e.preventDefault();
        setIsFinished(true);
      }
    };

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDblClick);

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDblClick);
    };
  }, [isFinished, isViewMode, waypoints, setWaypoints, setRedoStack, setIsFinished]);

  // 3. Renderizado y Animación Progresiva de la Ruta
  useEffect(() => {
    const map = mapRef.current;
    
    // Si el mapa o sus capas aún no se han terminado de cargar, esperamos
    if (!map || !mapLoaded) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Colocar marcadores numerados
    waypoints.forEach((pt, index) => {
      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      el.innerText = index + 1;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(pt)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (waypoints.length < 2) {
      if (map.getSource('route-source')) {
        map.getSource('route-source').setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      onDistanceChangeRef.current(0);
      return;
    }

    // Encuadrar la toma sobre la carrera consultada
    if (isViewMode) {
      const bounds = new mapboxgl.LngLatBounds();
      waypoints.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 });
    }

    const coordsString = waypoints.map((pt) => pt.join(',')).join(';');
    const url =
      mode === 'manual' && !isFinished && !isViewMode
        ? null
        : mode === 'manual'
        ? `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordsString}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
        : `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsString}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    const processGeometry = (geometry, distanceKm) => {
      onDistanceChangeRef.current(distanceKm);

      if (!map.getSource('route-source')) return;

      if (isViewMode) {
        // Dibujado progresivo punto por punto
        const coordinates = geometry.coordinates;
        let currentStep = 1;
        const totalSteps = coordinates.length;
        const stepSpeed = Math.max(1, Math.floor(totalSteps / 60));

        const drawStep = () => {
          currentStep = Math.min(currentStep + stepSpeed, totalSteps);
          const animatedCoords = coordinates.slice(0, currentStep);

          if (map.getSource('route-source')) {
            map.getSource('route-source').setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: animatedCoords,
              },
            });
          }

          if (currentStep < totalSteps) {
            animFrameRef.current = requestAnimationFrame(drawStep);
          }
        };

        drawStep();
      } else {
        map.getSource('route-source').setData({
          type: 'Feature',
          properties: {},
          geometry: geometry,
        });
      }
    };

    if (!url) {
      const lineFeature = turf.lineString(waypoints);
      const rawKm = turf.length(lineFeature, { units: 'kilometers' });
      processGeometry(lineFeature.geometry, rawKm);
      return;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let routeGeo = null;
        let routeDist = 0;

        if (data.routes && data.routes.length > 0) {
          routeGeo = data.routes[0].geometry;
          routeDist = data.routes[0].distance / 1000;
        } else if (data.matchings && data.matchings.length > 0) {
          routeGeo = data.matchings[0].geometry;
          routeDist = data.matchings[0].distance / 1000;
        } else {
          const lineFeature = turf.lineString(waypoints);
          routeGeo = lineFeature.geometry;
          routeDist = turf.length(lineFeature, { units: 'kilometers' });
        }

        processGeometry(routeGeo, routeDist);
      })
      .catch((err) => {
        console.error('Error al procesar la ruta:', err);
        const lineFeature = turf.lineString(waypoints);
        processGeometry(lineFeature.geometry, turf.length(lineFeature, { units: 'kilometers' }));
      });
  }, [waypoints, mode, profile, isFinished, isViewMode, mapLoaded]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}