import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { NodeTelemetry, DisplacementLink, AIRiskAssessment } from '../types/telemetry';

interface GisMapProps {
  nodes: NodeTelemetry[];
  links: DisplacementLink[];
  riskAssessment: AIRiskAssessment;
  onSelectNode?: (nodeId: string) => void;
  height?: string;
}

export const GisMap: React.FC<GisMapProps> = ({
  nodes,
  links,
  riskAssessment,
  onSelectNode,
  height = '480px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center above Jharia Coalfield surface demo panel (23.7580, 86.4150)
      const map = L.map(mapContainerRef.current, {
        center: [23.7580, 86.4150],
        zoom: 17,
        zoomControl: true,
      });

      // Esri World Imagery (Satellite tiles for surface mine view) with OpenStreetMap fallback
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Surface Mine Panel A-01',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when telemetry changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Surface Coal Panel Boundary Polygon
    const panelBoundary = [
      [23.7592, 86.4140],
      [23.7594, 86.4162],
      [23.7570, 86.4165],
      [23.7568, 86.4142],
    ];
    L.polygon(panelBoundary as L.LatLngTuple[], {
      color: '#38BDF8',
      weight: 2,
      dashArray: '5, 5',
      fillColor: '#0284C7',
      fillOpacity: 0.08,
    }).bindTooltip('Underground Coal Panel A-01 (Surface Projection)', { permanent: true, direction: 'top' })
      .addTo(layerGroup);

    // 2. Draw Spatial Risk Interpolation Area using Turf.js if Warning or Critical
    const criticalNodes = nodes.filter(n => n.status === 'CRITICAL' || n.status === 'WARNING');
    if (criticalNodes.length >= 2) {
      const points = criticalNodes.map(n => turf.point([n.lng, n.lat]));
      const featureCollection = turf.featureCollection(points);
      const convex = turf.convex(featureCollection);
      if (convex) {
        const buffered = turf.buffer(convex, 0.03, { units: 'kilometers' });
        if (buffered) {
          const coords = buffered.geometry.coordinates[0].map(c => [c[1], c[0]] as [number, number]);
          const riskColor = riskAssessment.risk_level === 'CRITICAL' ? '#EF4444' : '#F59E0B';
          L.polygon(coords, {
            color: riskColor,
            weight: 3,
            fillColor: riskColor,
            fillOpacity: 0.3,
          }).bindPopup(`<b>Surface Deformation Risk Zone</b><br>Severity: ${riskAssessment.risk_level}<br>Score: ${riskAssessment.risk_score}`)
            .addTo(layerGroup);
        }
      }
    }

    // 3. Draw Relative Displacement Link Lines (N1-N2, N2-N3, N3-N4, N1-N4)
    for (const link of links) {
      const nodeA = nodes.find(n => n.node_id === link.node_a);
      const nodeB = nodes.find(n => n.node_id === link.node_b);

      if (nodeA && nodeB) {
        const strokeColor = link.status === 'CRITICAL' 
          ? '#EF4444' 
          : link.status === 'WARNING' 
            ? '#F59E0B' 
            : '#10B981';

        const polyline = L.polyline([
          [nodeA.lat, nodeA.lng],
          [nodeB.lat, nodeB.lng]
        ], {
          color: strokeColor,
          weight: link.status === 'CRITICAL' ? 4 : 2.5,
          dashArray: link.status === 'CRITICAL' ? '4, 4' : undefined,
        }).addTo(layerGroup);

        polyline.bindTooltip(
          `Link ${link.link_id} (${link.node_a}–${link.node_b})<br>Rel. Disp: <b>${link.relative_displacement_mm} mm</b>`,
          { sticky: true }
        );
      }
    }

    // 4. Draw Node Markers
    for (const node of nodes) {
      const markerColor = node.status === 'CRITICAL' 
        ? '#EF4444' 
        : node.status === 'WARNING' 
          ? '#F59E0B' 
          : node.status === 'OFFLINE'
            ? '#6B7280'
            : '#10B981';

      // Custom SVG Circle Marker
      const customIcon = L.divIcon({
        className: 'custom-node-icon',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            font-weight: bold;
          ">
            ${node.node_id.replace('N', '')}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(layerGroup);

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; font-size: 12px;">
          <h4 style="font-weight: bold; margin-bottom: 4px; font-family: 'IBM Plex Sans';">
            Surface Sensor Node ${node.node_id}
          </h4>
          <p style="margin: 2px 0;">Status: <b>${node.status}</b></p>
          <p style="margin: 2px 0;">Tilt Mag: <b>${node.tilt_magnitude_deg}°</b> (X:${node.tilt_x_deg}°, Y:${node.tilt_y_deg}°)</p>
          <p style="margin: 2px 0;">Rel. Disp: <b>${node.displacement_mm} mm</b></p>
          <p style="margin: 2px 0;">Vibration RMS: <b>${node.vibration_rms} g</b></p>
          <p style="margin: 2px 0;">Crack Bridge: <b>${node.crack_detected ? 'BROKEN' : 'INTACT'}</b></p>
          <p style="margin: 2px 0;">Battery: <b>${node.battery_percent}%</b></p>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectNode) onSelectNode(node.node_id);
      });
    }

  }, [nodes, links, riskAssessment, onSelectNode]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-industrial-200 dark:border-industrial-800 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/90 dark:bg-industrial-900/90 backdrop-blur-md p-3 rounded-md border border-industrial-200 dark:border-industrial-800 text-[11px] font-body shadow-md">
        <p className="font-bold font-heading text-industrial-900 dark:text-white mb-1.5">Map Legend</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-status-safe inline-block" />
            <span className="text-industrial-700 dark:text-industrial-300">Safe Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-status-warning inline-block" />
            <span className="text-industrial-700 dark:text-industrial-300">Warning Threshold</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-status-critical inline-block" />
            <span className="text-industrial-700 dark:text-industrial-300">Critical Deformation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-status-offline inline-block" />
            <span className="text-industrial-700 dark:text-industrial-300">Offline Node</span>
          </div>
          <div className="pt-1 flex items-center space-x-2">
            <span className="w-6 h-0.5 bg-sky-500 border-dashed border-sky-500 border-t inline-block" />
            <span className="text-industrial-600 dark:text-industrial-400 font-mono text-[10px]">Coal Panel Boundary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
