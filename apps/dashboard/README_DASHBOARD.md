# Veera Safety Admin Dashboard Walkthrough

The Veera Safety Admin Dashboard is a sophisticated, real-time command center designed for the Veera Safety platform. It provides situational awareness, incident telemetry, and risk analytics for regional safety monitoring.

## 🚀 Key Features

*   **Real-time SOS Monitoring**: Live socket integration triggers instant notifications and pushes new incidents to the active feed.
*   **Intelligence Analytics**: Time-series charts and pattern recognition for identifying high-risk windows.
*   **Tactical Mission Control**: A high-fidelity dashboard combining live maps, KPI cards, and risk distribution grids.
*   **Risk Assessment Engine**: Automated risk scoring and neighboring response node tracking for every incident.

## 🛠️ Tech Stack

*   **React + Vite**: For high-performance, developer-friendly frontend.
*   **Tailwind CSS + Shadcn UI**: Modern, accessible, and premium-quality components.
*   **Recharts**: For deep data visualization and telemetry.
*   **React Leaflet**: For real-time incident mapping.
*   **Socket.io-Client**: Powers the live-node connection to the backend.

## 📁 Architecture Overview

### 🔐 Authentication
The dashboard uses a secure OTP-based flow. Upon successful verification, the token is saved to `localStorage` as `veera_token`.

### ⚡ Real-time Layer
A singleton socket instance is established in `src/lib/socket.js`, shared across the application via the `useSocket` hook.

### 📊 Custom Components
*   **RiskGauge**: SVG-based visualization of danger levels.
*   **HeatmapGrid**: 3x3 predictive matrix for regional risk.
*   **LiveMap**: Dark-themed geospatial view of active SOS signals.

## 🏁 How to Run

1.  Navigate to the dashboard directory:
    ```bash
    cd apps/dashboard
    ```
2.  (Optional) Verify dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev -- --port 3001
    ```
4.  Access the tactical terminal at `http://localhost:3001`.

> [!IMPORTANT]
> The dashboard is configured to communicate with the local backend at `http://localhost:5000`. Ensure the backend server is running for full functionality.
