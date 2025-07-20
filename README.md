# Vehicle Movement Simulation

A React-based web application for visualizing and simulating vehicle movement on an interactive map. Built with Vite, React, and Leaflet, this application provides a real-time simulation of a vehicle moving along a predefined route.

## 🚀 Features

- 🗺️ Interactive map using Leaflet.js
- 🚌 Real-time vehicle movement simulation
- ⏱️ Play/Pause/Reset controls for simulation
- 🎚️ Adjustable simulation speed
- 📊 Real-time metrics (speed, distance, time elapsed)
- 📍 Route visualization with polyline
- 🚦 Current position marker with direction indicator

## 🛠️ Tech Stack

- ⚛️ React 19
- 🚀 Vite (Build tool)
- 🍃 Leaflet & React-Leaflet (Maps)
- 📦 Axios (HTTP client)
- 🧭 Google Maps Polyline Codec (Route encoding/decoding)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/iakshayrathee/schoolbus-intern-task.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🚦 Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Project Structure

```
Root/
├── src/
│   ├── components/
│   │   └── map/
│   │       ├── MapView.jsx    # Main map component with simulation logic
│   │       └── MapView.css    # Styling for the map component
│   ├── data/
│   │   └── dummy-route.json   # Sample route data with coordinates and timestamps
│   ├── utils/
│   │   └── polylineUtils.js   # Utility functions for polyline encoding/decoding
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
└── package.json               # Project dependencies and scripts
```

## 📝 Usage

1. The application will load with a map centered on the predefined route.
2. Use the control panel to:
   - ▶️ Start/Pause the simulation
   - 🔄 Reset the simulation
   - 🎚️ Adjust the simulation speed
3. View real-time metrics including:
   - Current speed
   - Distance traveled
   - Elapsed time
   - Current position coordinates

## 🛠️ Customization

### Changing the Route

To use a different route, modify the `dummy-route.json` file in the `src/data/` directory. The file should contain an array of objects with the following structure (timestamps are optional but recommended for accurate simulation):

```json
[
  {
    "latitude": 28.63159,
    "longitude": 77.09797,
    "timestamp": "2025-07-21T10:00:00.000Z"
  },
  // ... more points
]
```

### Styling

- Map styling can be customized in `src/components/map/MapView.css`
- Global styles can be modified in `src/index.css`

## 📚 Dependencies

- `react`: ^19.1.0
- `react-dom`: ^19.1.0
- `leaflet`: ^1.9.4
- `react-leaflet`: ^5.0.0
- `axios`: ^1.10.0
- `@googlemaps/polyline-codec`: ^1.0.28

---

Made with ❤️ by [Akshay Rathee](https://github.com/iakshayrathee)
