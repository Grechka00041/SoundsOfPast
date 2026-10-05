import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState, useCallback } from 'react';
import { TrackMarkers } from './TrackMarkers';
import './Map.css';

interface Track {
    id: string | number;
    title: string;
    artist?: string;
    duration: number;
    region: string;
    isInstrument: boolean;
}

interface RegionMapProps {
    tracks: Track[];
}

const MapContent = ({
                        tracks,
                        geoData,
                        selectedRegionName,
                        onSelect
                    }: {
    tracks: Track[],
    geoData: any,
    selectedRegionName: string | null,
    onSelect: (name: string | null) => void
}) => {
    const map = useMap();

    const handleFeatureClick = useCallback((e: any) => {
        const name = e.target.feature.properties.name;
        if (selectedRegionName === name) {
            onSelect(null);
            map.flyTo([62, 95], 3, { duration: 1.2 });
        } else {
            onSelect(name);
            map.flyToBounds(e.target.getBounds(), {
                padding: [50, 50],
                maxZoom: 8,
                duration: 1.2
            });
        }
    }, [selectedRegionName, map, onSelect]);

    const selectedRegionFeature = geoData?.features.find(
        (f: any) => f.properties.name === selectedRegionName
    );

    return (
        <>

            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
            />

            <GeoJSON
                data={geoData}
                style={(feature) => {
                    if (!feature) return { className: 'region-polygon' };
                    return {
                        className: feature.properties.name === selectedRegionName
                            ? 'region-polygon selected'
                            : 'region-polygon'
                    };
                }}
                onEachFeature={(feature, layer) => {
                    layer.bindTooltip(feature.properties.name, {
                        direction: 'center',
                        className: 'region-label',
                        sticky: true
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
                        click: handleFeatureClick
                    });
                }}
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
    const [geoData, setGeoData] = useState<any>(null);
    const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/ru-subjects-contour.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Ошибка загрузки GeoJSON:", err));
    }, []);

    if (!geoData) return <div className="h-full w-full flex items-center justify-center bg-[#120a14] text-[#00ff66] font-mono">LOADING MAP DATA...</div>;

    return (
        <MapContainer
            center={[62, 95]}
            zoom={3}
            className="h-full w-full"
            maxBounds={[[-10, -180], [90, 180]]}
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