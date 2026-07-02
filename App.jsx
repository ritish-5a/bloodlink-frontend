import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Droplets, Hospital, Phone, Search, Activity, Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icon Fix
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
  const [userLoc, setUserLoc] = useState({ lat: 13.0258, lng: 77.6305 });
  const [immediate, setImmediate] = useState([]);
  const [surrounding, setSurrounding] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
    }, (err) => console.log("Location denied"), { enableHighAccuracy: true });
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://bloodlink-pro-b.onrender.com/find-nearby?user_lat=${userLoc.lat}&user_lng=${userLoc.lng}`);
      
      // SAFETY CHECK: If backend sends old format (list), convert it to new format
      if (Array.isArray(res.data)) {
        setImmediate(res.data.filter(item => item.distance <= 5));
        setSurrounding(res.data.filter(item => item.distance > 5));
      } else {
        setImmediate(res.data.immediate || []);
        setSurrounding(res.data.surrounding || []);
      }
    } catch (e) { 
      alert("Backend is waking up... wait 10 seconds."); 
    }
    setLoading(false);
  };

  const ResourceCard = ({ item }) => (
    <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: item.type === 'Hospital' ? '#2563eb' : '#e11d48', padding: '10px', backgroundColor: item.type === 'Hospital' ? '#eff6ff' : '#fff1f2', borderRadius: '12px' }}>
          {item.type === 'Hospital' ? <Hospital size={22}/> : <Droplets size={22}/>}
        </div>
        <div>
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{item.name}</h3>
          <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>{item.distance} KM AWAY</p>
        </div>
      </div>
      <a href={`tel:${item.contact}`} style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex' }}><Phone size={18} /></a>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ backgroundColor: '#e11d48', padding: '15px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={22}/> BLOODLINK PRO</div>
        <button onClick={handleScan} style={{ backgroundColor: 'white', color: '#e11d48', border: 'none', padding: '10px 18px', borderRadius: '50px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
          {loading ? "SCANNING..." : "SCAN AREA"}
        </button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '15px' }}>
        <div style={{ height: '300px', borderRadius: '25px', overflow: 'hidden', marginBottom: '25px', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={14} style={{ height: '100%' }}>
            <ChangeView center={[userLoc.lat, userLoc.lng]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[userLoc.lat, userLoc.lng]}><Popup>You</Popup></Marker>
            {[...immediate, ...surrounding].map((item, i) => (
              item.lat && item.lat !== 0 && <Marker key={i} position={[item.lat, item.lng]}><Popup>{item.name}</Popup></Marker>
            ))}
          </MapContainer>
        </div>

        {immediate.length > 0 && (
          <h2 style={{ fontSize: '11px', fontWeight: '900', color: '#e11d48', letterSpacing: '1.5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Navigation size={14}/> IMMEDIATE AREA (UNDER 5KM)
          </h2>
        )}
        {immediate.map((item, i) => <ResourceCard key={i} item={item} />)}

        {surrounding.length > 0 && (
          <h2 style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', letterSpacing: '1.5px', marginTop: '25px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14}/> SURROUNDING AREAS (5-15KM)
          </h2>
        )}
        {surrounding.map((item, i) => <ResourceCard key={i} item={item} />)}

        {immediate.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 'bold' }}>
            No data loaded. Tap SCAN AREA to start.
          </div>
        )}
      </div>
      <footer style={{ textAlign: 'center', padding: '30px', color: '#cbd5e1', fontSize: '10px', fontWeight: 'bold' }}>
        ARCHITECTED BY RITISH.S $ 2026
      </footer>
    </div>
  );
}