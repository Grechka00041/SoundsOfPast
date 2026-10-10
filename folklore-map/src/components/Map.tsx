import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { GeoJSON as LeafletGeoJSON } from 'leaflet';
import { TrackMarkers } from './TrackMarkers';
import { trackService, type Track } from '../services/trackService';
import { useGeoData } from '../hooks/useGeoData';
import type { RegionFeature } from '../types/map';
import './Map.css';

const MAP_CENTER: [number, number] = [62, 95];
const MAP_BOUNDS: [[number, number], [number, number]] = [[-10, -180], [90, 180]];

const MapContent = ({
                        geoData,
                        selectedRegionName,
                        onSelect,
                    }: {
    geoData: any;
    selectedRegionName: string | null;
    onSelect: (name: string | null) => void;
}) => {
    const map = useMap();
    const geoJsonRef = useRef<LeafletGeoJSON | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);

    // Загружаем треки ТОЛЬКО при смене выбранного региона
    useEffect(() => {
        if (!selectedRegionName) {
            setTracks([]);
            return;
        }

        const loadTracks = async () => {
            setIsLoadingTracks(true);
            const data = await trackService.getTracksByRegion(selectedRegionName);
            setTracks(data);
            setIsLoadingTracks(false);
        };

        loadTracks();
    }, [selectedRegionName]);

    // Мемоизируем поиск геометрии региона
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
                        geoJsonRef.current?.resetStyle(e.target);
                    }
                },
                click: handleFeatureClick,
            });
        },
        [selectedRegionName, handleFeatureClick]
    );

    // ✅ ВОТ ЭТО ЗАСТАВЛЯЕТ РЕГИОН ГОРЕТЬ ПРИ КЛИКЕ
    // При смене selectedRegionName перекрашиваем все фичи через getStyle
    useEffect(() => {
        const layer = geoJsonRef.current;
        if (!layer) return;
        layer.setStyle(getStyle as any);
    }, [getStyle, geoData]);

    return (
        <>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri"
            />

            <GeoJSON
                ref={geoJsonRef}
                data={geoData}
                style={getStyle}
                onEachFeature={onEachFeature}
            />

            {/* Показываем метки только если регион выбран И треки загружены */}
            {selectedRegionName && selectedRegionFeature && !isLoadingTracks && (
                    <TrackMarkers 
        tracks={tracks as any} 
        selectedRegionName={selectedRegionName} 
        regionGeometry={selectedRegionFeature.geometry} 
    />
            )}

            {/* Опционально: индикатор загрузки треков прямо на карте */}
            {isLoadingTracks && (
                <div style={{
                    position: 'absolute', bottom: '20px', right: '20px',
                    background: 'rgba(0,0,0,0.8)', color: '#00ffcc',
                    padding: '8px 12px', borderRadius: '4px', zIndex: 1000,
                    fontFamily: 'VT323, monospace', fontSize: '18px'
                }}>
                    ЗАГРУЗКА ТРЕКОВ...
                </div>
            )}
        </>
    );
};

export const RegionMap = () => {
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
                geoData={geoData}
                selectedRegionName={selectedRegionName}
                onSelect={setSelectedRegionName}
            />
        </MapContainer>
    );
};