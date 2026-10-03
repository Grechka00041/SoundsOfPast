import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import './Map.css';

const RegionLayer = ({
                         data,
                         selectedRegionName,
                         onSelect
                     }: {
    data: any,
    selectedRegionName: string | null,
    onSelect: (id: string | null) => void
}) => {
    const map = useMap();

    return (
        <GeoJSON
            data={data}
            pathOptions={{ className: 'region-polygon' }}
            onEachFeature={(feature, layer) => {

                layer.bindTooltip(feature.properties.name, {
                    direction: 'center',
                    className: 'region-label'
                });

                layer.on({
                    mouseover: (e) => {
                        const l = e.target;
                        if (l.feature.properties.name !== selectedRegionName) {
                            l.setStyle({ fillOpacity: 0.8 });
                            l.bringToFront();
                        }
                    },
                    mouseout: (e) => {
                        const l = e.target;
                        if (l.feature.properties.name !== selectedRegionName) {
                            l.setStyle({ fillOpacity: 0.7 });
                        }
                    },
                    click: (e) => {
                        const regionName = e.target.feature.properties.name;

                        if (selectedRegionName === regionName) {
                            onSelect(null);
                            e.target.getElement().classList.remove('selected');
                            map.flyTo([62, 95], 3, { duration: 1.2 });
                        } else {
                            onSelect(regionName);
                            map.flyToBounds(e.target.getBounds(), {
                                padding: [50, 50],
                                maxZoom: 8,
                                duration: 1.2
                            });
                        }
                    }
                });
            }}
        />
    );
};

export const RegionMap = () => {
    const [geoData, setGeoData] = useState<any>(null);
    const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/ru-subjects-contour.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Ошибка загрузки GeoJSON:", err));
    }, []);

    if (!geoData) return <div className="h-screen flex items-center justify-center bg-gray-50">Загрузка карты...</div>;

    return (
        <MapContainer center={[62, 95]} zoom={3} className="h-screen w-full" maxBounds={[[-10, -180], [90, 180]]} maxBoundsViscosity={1.0}>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
            />

            <RegionLayer
                data={geoData}
                selectedRegionName={selectedRegionName}
                onSelect={setSelectedRegionName}
            />
        </MapContainer>
    );
};