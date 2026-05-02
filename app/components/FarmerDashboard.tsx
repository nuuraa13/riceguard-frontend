"use client";
import React, { useState, useEffect } from 'react';

interface RiceListing {
  id: string;
  variety: string;
  quantity: number;
  price: number;
  verified: boolean;
}

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  material: string;
  weight: string;
  price: number;
  status: string;
  pickup_pin: string | null;
}

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('sell');
  const [myListings, setMyListings] = useState<RiceListing[]>([]);
  const [myShipments, setMyShipments] = useState<Shipment[]>([]);
  const [formData, setFormData] = useState({
    variety: '', quantity: '', grainLength: '', grainBreadth: '', price: '', farmerName: '', location: '', phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', isError: false });
  const [user, setUser] = useState({ full_name: "Farmer", email: "", location: "Punjab" });
  const [prediction, setPrediction] = useState({ change: '+ 0.0%', sentiment: 'Waiting...', advice: 'Enter a rice variety to see AI insights.' });
  const [wallet, setWallet] = useState({ available: 0, locked: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({ full_name: userData.full_name || userData.fullName || "Farmer", email: userData.email, location: userData.location || "Punjab" });
    }
  }, []);

  const fetchData = async () => {
    if (!user.email) return;
    try {
      const resList = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/my-listings?email=${user.email}`);
      if (resList.ok) setMyListings(await resList.json());
      
      const resShip = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/my-shipments?email=${user.email}&role=farmer`);
      if (resShip.ok) setMyShipments(await resShip.json());

      const resStats = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/user-stats?email=${user.email}`);
      if (resStats.ok) {
        const s = await resStats.json();
        setWallet({ available: s.balance, locked: s.locked_balance });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [user.email, activeTab]);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const update = { full_name: data.get("fullName") as string, location: data.get("location") as string, phone: "" };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/${user.email}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update)
      });
      if (res.ok) {
        setUser({ ...user, full_name: update.full_name, location: update.location });
        alert("✅ Profile Updated Successfully!");
      }
    } catch (err) { alert("Error saving"); }
  };

  useEffect(() => {
    const getPrediction = async () => {
      if (formData.variety.length < 3) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/predict-price?variety=${encodeURIComponent(formData.variety)}`);
        const data = await res.json();
        setPrediction({ change: data.prediction || '+ 0.0%', sentiment: data.sentiment || 'Neutral', advice: data.advice || 'No advice available.' });
      } catch (err) {}
    };
    const timeoutId = setTimeout(getPrediction, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.variety]);

  const handleListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quantity || !formData.price || !formData.grainLength || !formData.grainBreadth) return alert("Please fill all numeric fields correctly.");
    setLoading(true); setStatus({ message: 'AI Analyzing Quality...', isError: false });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/list-rice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, quantity: parseFloat(formData.quantity), grainLength: parseFloat(formData.grainLength), grainBreadth: parseFloat(formData.grainBreadth), price: parseFloat(formData.price), farmerName: formData.farmerName || user.full_name, location: formData.location || user.location, phone: formData.phone || "0300-1234567", ownerEmail: user.email }),
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setStatus({ message: 'Success! Verified and Listed.', isError: false });
        setFormData({ variety: '', quantity: '', grainLength: '', grainBreadth: '', price: '', farmerName: '', location: '', phone: '' });
        fetchData();
        setTimeout(() => { setStatus({ message: '', isError: false }); setActiveTab('listings'); }, 1500);
      } else { setStatus({ message: result.message || 'Verification Failed', isError: true }); }
    } catch (error) { setStatus({ message: 'Server Error', isError: true }); } finally { setLoading(false); }
  };

  const inputStyle = "w-full p-4 border border-gray-200 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#1B4332] text-gray-700 transition-all";
  const labelStyle = "text-xs font-bold text-[#1B4332] mb-2 block uppercase tracking-wider";

  return (
    <div className="flex min-h-screen bg-[#F4F7F6]">
      <aside className="w-64 bg-[#1B4332] text-white flex flex-col p-6 fixed h-full shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-lg font-black text-[#1B4332]">🌱</div>
          <span className="text-xl font-bold tracking-tight">RiceGuard</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[ { id: 'sell', label: 'Sell Rice', icon: '🌾' }, { id: 'listings', label: 'My Listings', icon: '📋' }, { id: 'shipments', label: 'Shipments', icon: '🚚' }, { id: 'wallet', label: 'Wallet', icon: '💼' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all font-semibold ${activeTab === item.id ? 'bg-[#D4AF37] text-[#1B4332]' : 'hover:bg-white/10'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all font-semibold mt-4 ${activeTab === 'settings' ? 'bg-[#D4AF37] text-[#1B4332]' : 'hover:bg-white/10'}`}><span>⚙️</span><span>Settings</span></button>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-[#1B4332]">{user.full_name?.charAt(0)}</div>
            <div className="flex flex-col text-left overflow-hidden"><span className="text-sm font-bold truncate">{user.full_name}</span><span className="text-[10px] opacity-50 truncate uppercase tracking-tighter">Farmer</span></div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-12">
        <header className="mb-10 flex justify-between items-center text-left">
          <div><h1 className="text-3xl font-black text-[#1B4332]">Farmer Dashboard</h1><p className="text-gray-500">Welcome, {user.full_name} • {user.location}</p></div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline transition-all">Logout →</button>
        </header>

        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-12 min-h-[600px]">
          {activeTab === 'sell' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#1B4332] mb-8">List Your Paddy</h2>
                {status.message && <div className={`mb-4 p-4 rounded-xl text-sm font-bold ${status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{status.message}</div>}
                <form onSubmit={handleListing} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><label className={labelStyle}>Rice Variety</label><input type="text" value={formData.variety} onChange={(e)=>setFormData({...formData, variety: e.target.value})} className={inputStyle} required/></div>
                  <div><label className={labelStyle}>Quantity (Tons)</label><input type="number" value={formData.quantity} onChange={(e)=>setFormData({...formData, quantity: e.target.value})} className={inputStyle} required/></div>
                  <div><label className={labelStyle}>Price per Ton (PKR)</label><input type="number" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} className={inputStyle} required/></div>
                  <div><label className={labelStyle}>Grain Length (mm)</label><input type="number" step="0.1" value={formData.grainLength} onChange={(e)=>setFormData({...formData, grainLength: e.target.value})} className={inputStyle} required/></div>
                  <div><label className={labelStyle}>Grain Breadth (mm)</label><input type="number" step="0.1" value={formData.grainBreadth} onChange={(e)=>setFormData({...formData, grainBreadth: e.target.value})} className={inputStyle} required/></div>
                  <button type="submit" disabled={loading} className="col-span-2 py-5 bg-[#1B4332] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-[#143326] active:scale-95 transition-all">{loading ? "AI Analyzing..." : "Verify & List for Sale"}</button>
                </form>
              </div>
              <div className="bg-[#F9FBFA] p-8 rounded-[30px] border border-gray-100 h-fit">
                <h3 className="text-lg font-bold text-[#1B4332] mb-6">📈 AI Price Prediction</h3>
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Expected Trend</p><p className="text-xl font-black text-[#D4AF37]">{prediction.change}</p></div>
                  <div className="pb-4 border-b border-gray-200"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Market Sentiment</p><p className="text-xl font-black text-[#1B4332]">{prediction.sentiment}</p></div>
                  <p className="text-[10px] text-gray-400 italic">{prediction.advice}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6 text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-6">My Listings</h2>
              {myListings.map((item, idx) => (
                <div key={idx} className="p-8 border border-gray-100 rounded-[30px] flex justify-between items-center bg-[#F9FBFA]">
                  <div><h3 className="text-xl font-bold text-[#1B4332]">{item.variety}</h3><p className="text-sm text-gray-500 mt-1">{item.quantity}T • PKR {item.price}/T</p></div>
                  <div className="flex gap-3">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${item.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.verified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
              ))}
              {myListings.length === 0 && <p className="text-gray-400 font-bold text-center py-20">No active listings.</p>}
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-6 text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-6">My Shipments</h2>
              {myShipments.map((ship, idx) => (
                <div key={idx} className="p-8 border border-gray-100 rounded-[30px] bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full ${ship.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' : ship.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{ship.status.replace("_", " ")}</span>
                    <span className="font-bold text-[#1B4332]">{ship.material} ({ship.weight})</span>
                  </div>
                  {ship.status === 'ACCEPTED' && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <p className="text-sm text-yellow-700 mb-1 font-bold">Pickup PIN</p>
                          <p className="text-xs text-yellow-600 mb-2">Give this PIN to the transporter when they arrive to pick up the cargo.</p>
                          <p className="text-3xl font-black tracking-[0.5em] text-yellow-900">{ship.pickup_pin}</p>
                      </div>
                  )}
                </div>
              ))}
              {myShipments.length === 0 && <p className="text-gray-400 font-bold text-center py-20">No shipments yet.</p>}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="max-w-4xl mx-auto text-left">
              <div className="bg-[#2D4A3E] p-10 rounded-[30px] text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2"><span className="text-xl">📁</span><h2 className="text-xl font-bold">My Wallet</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/10 border border-white/20 p-6 rounded-2xl"><p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-4">Pending Escrow</p><p className="text-4xl font-black text-[#D4AF37] mb-1">Rs {wallet.locked.toLocaleString()}</p></div>
                  <div className="bg-white/10 border border-white/20 p-6 rounded-2xl"><p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-4">Available Balance</p><p className="text-4xl font-black text-green-400 mb-1">Rs {wallet.available.toLocaleString()}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto bg-[#F9FBFA] p-10 rounded-[30px] border border-gray-100 text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-8 text-center">Profile Settings</h2>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div><label className={labelStyle}>Full Name</label><input type="text" name="fullName" defaultValue={user.full_name} className={inputStyle} required /></div>
                <div><label className={labelStyle}>Location</label><input type="text" name="location" defaultValue={user.location} className={inputStyle} required /></div>
                <button type="submit" className="w-full py-4 bg-[#1B4332] text-white rounded-2xl font-bold shadow-lg">Save Changes</button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}