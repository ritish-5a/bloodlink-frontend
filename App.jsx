import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Droplets, Hospital, Phone, Search, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((p) => {
        setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  }, []);

  const searchHelp = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://bloodlink-pro-b.onrender.com/find-nearby?user_lat=${userLoc.lat}&user_lng=${userLoc.lng}`);
      setData(res.data);
    } catch (e) { 
      alert("Backend is starting up... Please wait 10 seconds and try again."); 
    }
    setLoading(false);
  };

  const styles = {
    nav: { backgroundColor: '#e11d48', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    btn: { backgroundColor: 'white', color: '#e11d48', padding: '10px 20px', borderRadius: '50px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    card: { backgroundColor: 'white', padding: '15px', borderRadius: '20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' },
    callBtn: { backgroundColor: '#0f172a', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={styles.nav}>
        <h1 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} /> BLOODLINK PRO
        </h1>
        <button onClick={searchHelp} style={styles.btn}>
          {loading ? "..." : <><Search size={16}/> FIND HELP</>}
        </button>
      </nav>

      <div style={{ padding: '15px' }}>
        <div style={{ height: '350px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <ChangeView center={[userLoc.lat, userLoc.lng]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[userLoc.lat, userLoc.lng]}><Popup>You are here</Popup></Marker>
            {data.map(item => (
              <Marker key={item.id} position={[item.lat, item.lng]}>
                <Popup><strong>{item.name}</strong><br/>{item.type}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', marginBottom: '15px' }}>NEARBY RESOURCES</h2>
          {data.length === 0 && <p style={{textAlign:'center', color:'#94a3b8', marginTop: '20px'}}>Tap FIND HELP to see donors.</p>}
          {data.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{color: item.type === 'Hospital' ? '#2563eb' : '#e11d48'}}>
                  {item.type === 'Hospital' ? <Hospital size={24}/> : <Droplets size={24}/>}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{item.name}</h3>
                  <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{item.distance} KM AWAY</p>
                </div>
              </div>
              <a href={`tel:${item.contact}`} style={styles.callBtn}><Phone size={18} /></a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}