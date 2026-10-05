import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useCallback, useMemo, useState } from 'react';
import { TrackMarkers } from './TrackMarkers';
import { useGeoData } from '../hooks/useGeoData';
import type { RegionFeature, Track } from '../types/map';
import './Map.css';

interface RegionMapProps {
    tracks: Track[];
}

const MAP_CENTER: [number, number] = [62, 95];
const MAP_BOUNDS: [[number, number], [number, number]] = [[-10, -180], [90, 180]];

const MapContent = ({
                        tracks,
                        geoData,
                        selectedRegionName,
                        onSelect,
                    }: {
    tracks: Track[];
    geoData: any;
    selectedRegionName: string | null;
    onSelect: (name: string | null) => void;
}) => {
    const map = useMap();

    const selectedRegionFeature = useMemo(() => {
        if (!selectedRegionName || !geoData?.features) return null;
        return geoData.features.find(
            (f: RegionFeature) => f.properties.name === selectedRegionName
        );
    }, [selectedRegionName, geoData]);

    const handleFeatureClick = useCallback(
        (e: any) => {
            const name = e.target.feature.properties.name;
            if (selectedRegionName === name) {
                onSelect(null);
                map.flyTo(MAP_CENTER, 3, { duration: 1.2 });
            } else {
                onSelect(name);
                map.flyToBounds(e.target.getBounds(), {
                    padding: [50, 50],
                    maxZoom: 8,
                    duration: 1.2,
                });
            }
        },
        [selectedRegionName, map, onSelect]
    );

    const getStyle = useCallback(
        (feature?: any) => {
            if (!feature) return { className: 'region-polygon' };
            const isSelected = feature.properties.name === selectedRegionName;
            return {
                className: isSelected ? 'region-polygon selected' : 'region-polygon',
            };
        },
        [selectedRegionName]
    );

    const onEachFeature = useCallback(
        (feature: any, layer: any) => {
            layer.bindTooltip(feature.properties.name, {
                direction: 'center',
                className: 'region-label',
                sticky: true,
            });

            layer.on({
                mouseover: (e: any) => {
                    if (e.target.feature.properties.name !== selectedRegionName) {
                        e.target.setStyle({ fillOpacity: 0.8 });
                        e.target.bringToFront();
                    }
                },
                mouseout: (e: any) => {
                    if (e.target.feature.properties.name !== selectedRegionName) {
                        e.target.resetStyle();
                    }
                },
                click: handleFeatureClick,
            });
        },
        [selectedRegionName, handleFeatureClick]
    );

    return (
        <>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri"
            />

            <GeoJSON
                data={geoData}
                style={getStyle}
                onEachFeature={onEachFeature}
            />

            {selectedRegionName && selectedRegionFeature && (
                <TrackMarkers
                    tracks={tracks}
                    selectedRegionName={selectedRegionName}
                    regionGeometry={selectedRegionFeature}
                />
            )}
        </>
    );
};

export const RegionMap = ({ tracks }: RegionMapProps) => {
    const { data: geoData, loading, error } = useGeoData('/data/ru-subjects-contour.geojson');
    const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#120a14] text-[#00ff66] font-mono">
                ЗАГРУЗКА КАРТЫ...
            </div>
        );
    }

    if (error || !geoData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#120a14] text-[#ff00aa] font-mono gap-4">
                <p>ОШИБКА ЗАГРУЗКИ ДАННЫХ</p>
                <p className="text-sm text-[#00ffcc]">{error || 'GeoJSON недоступен'}</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={MAP_CENTER}
            zoom={3}
            className="h-full w-full"
            maxBounds={MAP_BOUNDS}
            maxBoundsViscosity={1.0}
        >
            <MapContent
                tracks={tracks}
                geoData={geoData}
                selectedRegionName={selectedRegionName}
                onSelect={setSelectedRegionName}
            />
        </MapContainer>
    );
};