import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Droplets, Hospital, Phone, MapPin, Search, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
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
    }, () => {
       console.log("Using default coordinates");
    });
  }, []);

  const searchHelp = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://bloodlink-pro-b.onrender.com/find-nearby?user_lat=${userLoc.lat}&user_lng=${userLoc.lng}`);
      setData(res.data);
    } catch (e) {
      alert("Error: Make sure the Python Backend is running on Port 8000!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50 font-sans">
      <nav className="bg-rose-600 text-white p-5 shadow-xl sticky top-0 z-[9999]">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-center sm:text-left">
          <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <Droplets className="fill-white" /> BLOODLINK PRO
          </h1>
          <button onClick={searchHelp} className="bg-white text-rose-600 px-8 py-2.5 rounded-full font-black shadow-lg hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-2">
            {loading ? "Searching..." : <><Search size={20}/> Find Emergency Help</>}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[550px] sticky top-24 bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-200">
          <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={13} style={{height: '100%', width: '100%'}}>
            <ChangeView center={[userLoc.lat, userLoc.lng]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[userLoc.lat, userLoc.lng]}><Popup>Your Location</Popup></Marker>
            {data.map(item => (
              <Marker key={item.id} position={[item.lat, item.lng]}>
                <Popup><strong>{item.name}</strong><br/>{item.type}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Navigation size={16}/> Nearby Resources
          </h2>
          
          {data.length === 0 && (
            <div className="p-16 text-center bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 text-slate-400 font-bold">
               Search above to find blood donors & hospitals.
            </div>
          )}
          
          {data.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-400 transition-all">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${item.type === 'Hospital' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.type === 'Hospital' ? <Hospital size={32}/> : <Droplets size={32}/>}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800 tracking-tight">{item.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type} • {item.distance} KM AWAY</p>
                </div>
              </div>
              <a href={`tel:${item.contact}`} className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-rose-600 transition-all">
                <Phone size={24} />
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}