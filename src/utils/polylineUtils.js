import { decode, encode } from '@googlemaps/polyline-codec';

export const encodePolyline = (coordinates) => {
  try {
    return encode(coordinates, 5);
  } catch (error) {
    console.error('Error encoding polyline:', error);
    return '';
  }
};

export const decodePolyline = (encodedPolyline) => {
  try {
    return decode(encodedPolyline, 5);
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
};

export const mockDirectionsResponse = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return {
      routes: [],
      status: 'ZERO_RESULTS',
    };
  }

  const encodedPolyline = encodePolyline(coordinates);
  
  const calculateDistance = (coords) => {
    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      const lat1 = coords[i - 1][0];
      const lng1 = coords[i - 1][1];
      const lat2 = coords[i][0];
      const lng2 = coords[i][1];
      
      // Haversine formula for distance calculation
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }
    return Math.round(totalDistance);
  };

  const distance = calculateDistance(coordinates);
  const duration = Math.round(distance / 50 * 3.6); // Rough estimate: 50 km/h average speed
  
  // This is a simplified version of a Google Maps Directions API response
  return {
    routes: [
      {
        overview_polyline: {
          points: encodedPolyline,
        },
        legs: [
          {
            steps: [
              {
                polyline: {
                  points: encodedPolyline,
                },
                start_location: {
                  lat: coordinates[0][0],
                  lng: coordinates[0][1],
                },
                end_location: {
                  lat: coordinates[coordinates.length - 1][0],
                  lng: coordinates[coordinates.length - 1][1],
                },
                distance: {
                  text: `${(distance / 1000).toFixed(1)} km`,
                  value: distance,
                },
                duration: {
                  text: `${Math.round(duration / 60)} mins`,
                  value: duration,
                },
                html_instructions: 'Follow the route',
                travel_mode: 'DRIVING',
              },
            ],
            distance: {
              text: `${(distance / 1000).toFixed(1)} km`,
              value: distance,
            },
            duration: {
              text: `${Math.round(duration / 60)} mins`,
              value: duration,
            },
            start_address: 'Start Point',
            end_address: 'End Point',
          },
        ],
        bounds: {
          northeast: {
            lat: Math.max(...coordinates.map((coord) => coord[0])),
            lng: Math.max(...coordinates.map((coord) => coord[1])),
          },
          southwest: {
            lat: Math.min(...coordinates.map((coord) => coord[0])),
            lng: Math.min(...coordinates.map((coord) => coord[1])),
          },
        },
        copyrights: 'Map data ©2024',
        summary: 'Route',
        warnings: [],
        waypoint_order: [],
      },
    ],
    status: 'OK',
  };
};

export const convertRouteToCoordinates = (routeData) => {
  if (!routeData || !Array.isArray(routeData)) {
    return [];
  }
  
  return routeData.map((point) => {
    // Handle different property name variations
    const lat = point.latitude || point.lat;
    const lng = point.longitude || point.lng || point.lon;
    
    if (lat === undefined || lng === undefined) {
      console.warn('Invalid coordinate point:', point);
      return [0, 0]; // Default fallback
    }
    
    return [lat, lng];
  });
};

export const sampleCoordinates = [
  [28.6139, 77.2090], // Delhi
  [28.6200, 77.2200], // Point 2
  [28.6300, 77.2300], // Point 3
  [28.6400, 77.2400], // Point 4
];

export const getSampleEncodedPolyline = () => {
  return encodePolyline(sampleCoordinates);
};