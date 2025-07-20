import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import L, { Icon } from 'leaflet';
import { useEffect, useState, useCallback } from 'react';
import routeData from '../../data/dummy-route.json';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { convertRouteToCoordinates, mockDirectionsResponse } from '../../utils/polylineUtils';

function ChangeView({ center, currentPosition, isPlaying, route = [] }) {
  const map = useMap();
  const [userZoom, setUserZoom] = useState(null);
  
  useEffect(() => {
    const handleZoom = () => {
      setUserZoom(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);
  
  useEffect(() => {
    if (center) {
      const newCenter = [center[0], center[1]];
      let targetZoom;
      
      if (!isPlaying && userZoom === null) {
        if (route.length > 0) {
          map.fitBounds(route, {
            padding: [50, 50],
            animate: true,
            duration: 1,
            easeLinearity: 0.5
          });
          return;
        }
        targetZoom = 14;
      } else {
        targetZoom = userZoom !== null ? userZoom : 18;
      }
      
      map.setView(newCenter, targetZoom, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.5
      });
    }
  }, [center, map, currentPosition, isPlaying, userZoom, route]);
  
  return null;
}

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const carIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744515.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const MapView = () => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [route, setRoute] = useState(() => convertRouteToCoordinates(routeData));
  const [directions, setDirections] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [simulationStartTime, setSimulationStartTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);

  useEffect(() => {
    const mockResponse = mockDirectionsResponse(route);
    setDirections(mockResponse);
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    let animationFrame;
    let lastPosition = 0;
    const FRAME_RATE = 60;
    const FRAME_INTERVAL = 1000 / FRAME_RATE;
    
    if (isPlaying && currentPosition < routeData.length - 1) {
      const startTimestamp = new Date(routeData[0].timestamp).getTime();
      const endTimestamp = new Date(routeData[routeData.length - 1].timestamp).getTime();
      const totalDuration = (endTimestamp - startTimestamp) / 1000;
      
      if (simulationStartTime === 0) {
        setSimulationStartTime(Date.now() - (elapsedTime * 1000 / speedMultiplier));
      }
      
      const updateSimulation = (currentTime) => {
        const realElapsedMs = Date.now() - simulationStartTime;
        const simulationTime = (realElapsedMs * speedMultiplier) / 1000;
        
        setElapsedTime(Math.min(Math.floor(simulationTime), Math.ceil(totalDuration)));
        
        let currentPositionIndex = 0;
        for (let i = 0; i < routeData.length; i++) {
          const pointTime = (new Date(routeData[i].timestamp).getTime() - startTimestamp) / 1000;
          if (pointTime <= simulationTime) {
            currentPositionIndex = i;
          } else {
            break;
          }
        }
        
        if (currentPositionIndex > lastPosition || simulationTime === 0) {
          setCurrentPosition(currentPositionIndex);
          lastPosition = currentPositionIndex;
          
          if (currentPositionIndex > 0) {
            const prevPoint = routeData[currentPositionIndex - 1];
            const currPoint = routeData[currentPositionIndex];
            const timeDiff = (new Date(currPoint.timestamp) - new Date(prevPoint.timestamp)) / 1000;
            const distance = calculateDistance(
              prevPoint.latitude,
              prevPoint.longitude,
              currPoint.latitude,
              currPoint.longitude
            );
            
            if (timeDiff > 0) {
              const speedKph = (distance / (timeDiff / 3600)).toFixed(2);
              setSpeed(speedKph);
            }
          }
        }
        
        if (simulationTime >= totalDuration) {
          setIsPlaying(false);
          setElapsedTime(Math.ceil(totalDuration));
          setCurrentPosition(routeData.length - 1);
          return;
        }
        
        if (isPlaying) {
          animationFrame = requestAnimationFrame(updateSimulation);
        }
      };
      
      animationFrame = requestAnimationFrame(updateSimulation);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, calculateDistance, speedMultiplier]);

  const togglePlayPause = () => {
    if (isPlaying) {
      setPausedTime(elapsedTime);
    } else {
      setSimulationStartTime(Date.now() - (elapsedTime * 1000 / speedMultiplier));
    }
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setCurrentPosition(0);
    setElapsedTime(0);
    setPausedTime(0);
    setSimulationStartTime(0);
    setSpeed(0);
    setIsPlaying(false);
  };

  const currentPoint = routeData[currentPosition];
  const traveledRoute = route.slice(0, currentPosition + 1);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Vehicle Movement Simulation</h2>
        {directions && directions.routes[0].legs[0] && (
          <div className="route-info">
            <div>Distance: {directions.routes[0].legs[0].distance.text}</div>
            <div>Estimated Duration: {directions.routes[0].legs[0].duration.text}</div>
          </div>
        )}
        <div className="controls">
          <button 
            className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
            onClick={togglePlayPause}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button className="control-btn reset" onClick={resetSimulation}>
            <span className="icon">🔄</span> Reset
          </button>
          <div className="speed-control">
            <button 
              className="speed-btn" 
              onClick={() => setSpeedMultiplier(prev => Math.max(1, prev - 1))}
              disabled={speedMultiplier <= 1}
            >
              -
            </button>
            <span className="speed-value">{speedMultiplier}x</span>
            <button 
              className="speed-btn" 
              onClick={() => setSpeedMultiplier(prev => prev + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <div className="map-info-panel">
        <div className="info-box">
          <span className="info-label">Position:</span>
          <span className="info-value">{currentPosition + 1} of {routeData.length}</span>
        </div>
        <div className="info-box">
          <span className="info-label">Coordinates:</span>
          <span className="info-value">
            {currentPoint?.latitude?.toFixed(6)}, {currentPoint?.longitude?.toFixed(6)}
          </span>
        </div>
        <div className="info-box">
          <span className="info-label">Elapsed Time:</span>
          <span className="info-value">{formatTime(elapsedTime)}</span>
        </div>
        {speed > 0 && (
          <div className="info-box">
            <span className="info-label">Speed:</span>
            <span className="info-value">{speed} km/h</span>
          </div>
        )}
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={route[0] || [28.6139, 77.2090]}
          zoom={14}
          zoomControl={true}
          scrollWheelZoom={true}
          className="google-map-style"
          minZoom={10}
          maxZoom={20}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }}
        >
        <ChangeView 
          center={currentPoint ? [currentPoint.latitude, currentPoint.longitude] : route[0] || [28.6139, 77.2090]} 
          currentPosition={currentPosition}
          isPlaying={isPlaying}
          route={route}
        />
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          maxZoom={19}
        />
        
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png"
          opacity={0.1}
          zIndex={1}
        />
        
        <Polyline 
          positions={route} 
          color="#1a73e8"
          weight={5}
          opacity={0.7}
          lineCap="round"
          lineJoin="round"
        />

          {currentPoint && (
            <Marker 
              position={[currentPoint.latitude, currentPoint.longitude]} 
              icon={DefaultIcon}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    <h3>Vehicle Position</h3>
                  </div>
                  <div className="popup-details">
                    <p><strong>Position:</strong> {currentPosition + 1} of {routeData.length}</p>
                    <p><strong>Speed:</strong> {speed} km/h</p>
                    <p><strong>Time:</strong> {formatTime(elapsedTime)}</p>
                    <p className="coordinates">
                      {currentPoint.latitude.toFixed(6)}, {currentPoint.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
