import React, { useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapLocation {
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  type?: 'worker' | 'task' | 'route' | 'landmark';
}

interface InteractiveMapProps {
  currentLocation: MapLocation;
  tasks?: MapLocation[];
  routes?: MapLocation[][];
  onLocationUpdate?: (location: MapLocation) => void;
  onTaskSelect?: (taskId: string) => void;
  height?: number;
}

export default function InteractiveMap({
  currentLocation,
  tasks = [],
  routes = [],
  onLocationUpdate,
  onTaskSelect,
  height = 300
}: InteractiveMapProps) {
  const webViewRef = useRef<WebView>(null);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          height: 100vh; 
          width: 100vw; 
        }
        .custom-popup {
          font-size: 14px;
        }
        .task-popup {
          background: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .worker-popup {
          background: #10b981;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map centered on Jabalpur
        const map = L.map('map').setView([23.1815, 79.9864], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom icons
        const workerIcon = L.divIcon({
          html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">👷</div>',
          iconSize: [24, 24],
          className: 'custom-div-icon'
        });

        const taskIcon = L.divIcon({
          html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📋</div>',
          iconSize: [22, 22],
          className: 'custom-div-icon'
        });

        const urgentTaskIcon = L.divIcon({
          html: '<div style="background: #dc2626; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚨</div>',
          iconSize: [24, 24],
          className: 'custom-div-icon'
        });

        // Add worker location marker
        const workerMarker = L.marker([${currentLocation.lat}, ${currentLocation.lng}], {
          icon: workerIcon
        }).addTo(map);
        
        workerMarker.bindPopup(
          '<div class="worker-popup"><strong>🚛 Your Location</strong><br/>📍 Current Position</div>'
        );

        // Add task markers
        ${tasks.map((task, index) => `
          const taskMarker${index} = L.marker([${task.lat}, ${task.lng}], {
            icon: ${task.description?.includes('urgent') ? 'urgentTaskIcon' : 'taskIcon'}
          }).addTo(map);
          
          taskMarker${index}.bindPopup(
            '<div class="task-popup"><strong>📋 ${task.title || 'Task'}</strong><br/>${task.description || 'Waste collection task'}<br/><button onclick="selectTask(${index})" style="background: white; color: #3b82f6; border: none; padding: 4px 8px; border-radius: 4px; margin-top: 4px; cursor: pointer;">View Details</button></div>'
          );
        `).join('')}

        // Add route polylines
        ${routes.map((route, routeIndex) => `
          const route${routeIndex} = [
            ${route.map(point => `[${point.lat}, ${point.lng}]`).join(', ')}
          ];
          
          L.polyline(route${routeIndex}, {
            color: '${routeIndex === 0 ? '#3b82f6' : '#10b981'}',
            weight: 4,
            opacity: 0.7,
            dashArray: '${routeIndex === 0 ? '0' : '10, 5'}'
          }).addTo(map);
        `).join('')}

        // Add Jabalpur landmarks
        const landmarks = [
          { lat: 23.1815, lng: 79.9864, name: "City Center", icon: "🏢" },
          { lat: 23.1751, lng: 79.9851, name: "Waste Processing Plant", icon: "🏭" },
          { lat: 23.1825, lng: 79.9870, name: "Collection Point A", icon: "🗑️" },
          { lat: 23.1795, lng: 79.9880, name: "Collection Point B", icon: "🗑️" },
          { lat: 23.1835, lng: 79.9845, name: "Residential Zone", icon: "🏘️" }
        ];

        landmarks.forEach((landmark, index) => {
          const landmarkIcon = L.divIcon({
            html: '<div style="background: #f59e0b; color: white; border-radius: 6px; padding: 2px 6px; font-size: 10px; border: 1px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">' + landmark.icon + '</div>',
            iconSize: [30, 20],
            className: 'custom-div-icon'
          });
          
          L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon })
            .bindPopup('<div class="custom-popup"><strong>' + landmark.icon + ' ' + landmark.name + '</strong></div>')
            .addTo(map);
        });

        // Function to handle task selection
        function selectTask(taskIndex) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'taskSelected',
            taskIndex: taskIndex
          }));
        }

        // Update worker location function
        function updateWorkerLocation(lat, lng) {
          workerMarker.setLatLng([lat, lng]);
          map.panTo([lat, lng]);
        }

        // Listen for messages from React Native
        document.addEventListener('message', function(e) {
          const data = JSON.parse(e.data);
          if (data.type === 'updateLocation') {
            updateWorkerLocation(data.lat, data.lng);
          }
        });

        // Fit map to show all markers
        const allMarkers = [
          [${currentLocation.lat}, ${currentLocation.lng}],
          ${tasks.map(task => `[${task.lat}, ${task.lng}]`).join(', ')}
        ];
        
        if (allMarkers.length > 1) {
          const group = new L.featureGroup(map.getLayers());
          map.fitBounds(group.getBounds().pad(0.1));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'taskSelected' && onTaskSelect) {
        onTaskSelect(data.taskIndex.toString());
      }
    } catch (error) {
      console.error('Error parsing webview message:', error);
    }
  };

  const updateLocation = (location: MapLocation) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateLocation',
        lat: location.lat,
        lng: location.lng
      }));
    }
  };

  useEffect(() => {
    updateLocation(currentLocation);
  }, [currentLocation]);

  if (Platform.OS === 'web') {
    return (
      <View style={{ height, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#6b7280', textAlign: 'center' }}>
          🗺️ Interactive map not supported on web<br />
          Use mobile device for full map experience
        </div>
      </View>
    );
  }

  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}
