import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import './Map.css';

interface Track {
    id: string | number;
    title: string;
    artist?: string;
    duration: number;
    region: string;
    isInstrument: boolean;
}

interface TrackMarkersProps {
    tracks: Track[];
    selectedRegionName: string | null;
    regionGeometry: any;
}

const centerCache = new Map<string, [number, number]>();

const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const TrackMarkers = ({ tracks, selectedRegionName, regionGeometry }: TrackMarkersProps) => {
    const map = useMap();
    const markersRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!markersRef.current) {
            markersRef.current = L.layerGroup().addTo(map);
        }
        return () => {
            if (markersRef.current) {
                map.removeLayer(markersRef.current);
                markersRef.current = null;
            }
        };
    }, [map]);

    useEffect(() => {
        if (!markersRef.current || !selectedRegionName || !regionGeometry) {
            markersRef.current?.clearLayers();
            return;
        }

        markersRef.current.clearLayers();

        let center: [number, number];
        if (centerCache.has(selectedRegionName)) {
            center = centerCache.get(selectedRegionName)!;
        } else {
            try {
                const centroid = turf.centroid(regionGeometry);
                center = [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]];
                centerCache.set(selectedRegionName, center);
            } catch (e) {
                console.error('Error calculating centroid:', e);
                return;
            }
        }

        const regionTracks = tracks.filter(t => t.region === selectedRegionName);

        regionTracks.forEach((track, index) => {
            const latOffset = Math.sin(index * 12.9898) * 0.4;
            const lonOffset = Math.cos(index * 78.233) * 0.4;

            const markerPos: [number, number] = [
                center[0] + latOffset,
                center[1] + lonOffset
            ];

            const pinHtml = `
                <div class="pin-wrapper">
                    <div class="permanent-track-label">${escapeHtml(track.title)}</div>
                    <div class="pin-container">
                        <div class="pin-head"></div>
                        <div class="pin-stem"></div>
                        <div class="pin-tip"></div>
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'track-pin', // Базовый класс для сброса стилей Leaflet
                html: pinHtml,
                iconSize: [100, 60], // Увеличиваем зону иконки, чтобы вместить подпись
                iconAnchor: [50, 60] // Точка привязки: центр по горизонтали, низ острия
            });

            const marker = L.marker(markerPos, { icon });

            // Попап оставляем как был (открывается по клику)
            let content = '';
            if (track.isInstrument) {
                content = `<div class="instrument-popup"><strong>${escapeHtml(track.title)}</strong></div>`;
            } else {
                const mins = Math.floor(track.duration / 60);
                const secs = track.duration % 60;
                const time = `${mins}:${secs.toString().padStart(2, '0')}`;

                content = `
                    <div class="popup-title">${escapeHtml(track.title)}</div>
                    <div class="popup-artist">${escapeHtml(track.artist || 'Unknown')}</div>
                    <div class="popup-duration"> ${time}</div>
                `;
            }

            marker.bindPopup(content, { className: 'retro-popup', maxWidth: 250 });
            markersRef.current!.addLayer(marker);
        });

    }, [tracks, selectedRegionName, regionGeometry]);

    return null;
};