import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Phone, Search, Activity, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function App() {
  const [userLoc, setUserLoc] = useState({ lat: 12.9716, lng: 77.5946 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to get fresh coordinates and then search
  const handleScan = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        
        try {
          // Send the NEW coordinates to the backend
          const res = await axios.get(`https://bloodlink-pro-b.onrender.com/find-nearby?user_lat=${latitude}&user_lng=${longitude}`);
          setData(res.data);
        } catch (e) {
          alert("Map service is slow. Trying again...");
        }
        setLoading(false);
      }, (error) => {
        alert("Please enable GPS/Location to use this app!");
        setLoading(false);
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ backgroundColor: '#e11d48', padding: '15px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ fontWeight: '900', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity /> BLOODLINK PRO</div>
        <button onClick={handleScan} style={{ backgroundColor: 'white', color: '#e11d48', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer' }}>
          {loading ? <Loader2 className="animate-spin" /> : "SCAN AREA"}
        </button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '15px' }}>
        <div style={{ height: '350px', borderRadius: '25px', overflow: 'hidden', marginBottom: '20px', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={14} style={{ height: '100%' }}>
            <ChangeView center={[userLoc.lat, userLoc.lng]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[userLoc.lat, userLoc.lng]}><Popup>You</Popup></Marker>
            {data.map((item, i) => (
              <Marker key={i} position={[item.lat, item.lng]}><Popup>{item.name}</Popup></Marker>
            ))}
          </MapContainer>
        </div>

        {data.map((item, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: '900' }}>{item.name}</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{item.type.toUpperCase()} • {item.distance} KM AWAY</p>
            </div>
            <a href={`tel:${item.contact}`} style={{ backgroundColor: '#0f172a', color: 'white', padding: '15px', borderRadius: '15px' }}><Phone size={20} /></a>
          </div>
        ))}
      </div>
      <footer style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>
        ARCHITECTED BY RITISH.S • GLOBAL VERSION @ 2026
      </footer>
    </div>
  );
}