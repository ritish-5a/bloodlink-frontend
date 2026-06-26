import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Droplets, Hospital, Phone, Search, Navigation, Info, Activity } from 'lucide-react';
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
    navigator.geolocation.getCurrentPosition((p) => {
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
    });
  }, []);

  const searchHelp = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://bloodlink-pro-b.onrender.com/find-nearby?user_lat=${userLoc.lat}&user_lng=${userLoc.lng}`);
      setData(res.data);
    } catch (e) { 
      alert("Backend is waking up... Please try again in 10 seconds."); 
    }
    setLoading(false);
  };

  // --- INTERNAL STYLES (Guarantees the Premium Look) ---
  const styles = {
    nav: { backgroundColor: '#e11d48', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    btn: { backgroundColor: 'white', color: '#e11d48', padding: '10px 25px', borderRadius: '50px', border: 'none', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '25px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    iconBox: (type) => ({ padding: '12px', borderRadius: '15px', backgroundColor: type === 'Hospital' ? '#eff6ff' : '#fff1f2', color: type === 'Hospital' ? '#2563eb' : '#e11d48' }),
    callBtn: { backgroundColor: '#0f172a', color: 'white', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', textDecoration: 'none' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      <nav style={styles.nav}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={28} /> BLOODLINK PRO
        </h1>
        <button onClick={searchHelp} style={styles.btn}>
          {loading ? "Searching..." : <><Search size={18}/> FIND HELP</>}
        </button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1.2fr 1fr' : '1fr', gap: '30px' }}>
        
        {/* MAP */}
        <div style={{ height: '500px', borderRadius: '30px', overflow: 'hidden', border: '5px solid white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
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

        {/* LIST */}
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '20px' }}>NEARBY RESOURCES (15KM)</h2>
          
          {data.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '30px' }}>
              Tap "FIND HELP" to search for donors.
            </div>
          )}

          {data.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles.iconBox(item.type)}>
                  {item.type === 'Hospital' ? <Hospital size={24}/> : <Droplets size={24}/>}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '900', fontSize: '18px' }}>{item.name}</h3>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>{item.type.toUpperCase()} • {item.distance} KM AWAY</p>
                </div>
              </div>
              <a href={`tel:${item.contact}`} style={styles.callBtn}><Phone size={20} /></a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}