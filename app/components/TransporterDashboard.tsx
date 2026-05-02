"use client";
import React, { useState, useEffect } from 'react';

interface Load {
  id: string;
  origin: string;
  destination: string;
  material: string;
  weight: string;
  price: number;
  status: string;
}

export default function TransporterDashboard() {
  const [activeTab, setActiveTab] = useState('load_board');
  const [availableLoads, setAvailableLoads] = useState<Load[]>([]);
  const [myTrips, setMyTrips] = useState<Load[]>([]);
  const [pinInput, setPinInput] = useState<{ [key: string]: string }>({});
  
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    location: "",
    phone: "",
    role: "transporter"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    location: ""
  });

  const labelStyle = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";
  const btnStyle = "w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all font-semibold capitalize text-left cursor-pointer";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const userData = {
        full_name: parsed.full_name || parsed.fullName || parsed.username || "Transporter",
        email: parsed.email || "",
        location: parsed.location || "Not Specified",
        phone: parsed.phone || "No Phone",
        role: parsed.role || "transporter"
      };
      setUser(userData);
      setEditForm({
        full_name: userData.full_name,
        phone: userData.phone,
        location: userData.location
      });
    }
  }, []);

  const fetchLoads = async () => {
    if (!user.email) return;
    try {
      const resLoads = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/available-loads`);
      if (resLoads.ok) setAvailableLoads(await resLoads.json());

      const resTrips = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/my-shipments?email=${user.email}&role=transporter`);
      if (resTrips.ok) setMyTrips(await resTrips.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, [user.email, activeTab]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Error updating profile.");
    }
  };

  const handleAcceptLoad = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/shipments/${id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporter_email: user.email })
      });
      if (res.ok) {
        alert("Load Accepted! Check Active Trips for Pickup PIN.");
        fetchLoads();
        setActiveTab("active_trips");
      }
    } catch (err) { alert("Failed to accept load."); }
  };

  const handleStartJourney = async (id: string) => {
    const entered_pin = pinInput[id];
    if (!entered_pin) return alert("Enter the Pickup PIN from the Seller.");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/shipments/${id}/start`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entered_pin })
      });
      if (res.ok) {
        alert("Journey Started! Drive safely.");
        fetchLoads();
      } else { alert("Invalid Pickup PIN."); }
    } catch (err) { alert("Error starting journey."); }
  };

  const handleVerifyDelivery = async (id: string) => {
    const entered_pin = pinInput[id];
    if (!entered_pin) return alert("Enter the Delivery PIN from the Buyer.");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/shipments/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entered_pin })
      });
      if (res.ok) {
        alert("Delivery Confirmed! Earnings added to your wallet.");
        fetchLoads();
      } else { alert("Invalid Delivery PIN."); }
    } catch (err) { alert("Error confirming delivery."); }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F6]">
      <aside className="w-64 bg-[#1B4332] text-white flex flex-col p-6 fixed h-full shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-xl font-bold text-[#1B4332]">🚚</div>
          <span className="text-xl font-bold tracking-tight text-left">RiceGuard</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[ { id: 'load_board', icon: '🛣️', label: 'Load Board' }, { id: 'active_trips', icon: '📍', label: 'Active Trips' }, { id: 'wallet', icon: '💼', label: 'Earnings' }, { id: 'profile', icon: '👤', label: 'Profile' } ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${btnStyle} ${activeTab === tab.id ? 'bg-[#D4AF37] text-[#1B4332]' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-[#1B4332] uppercase">{user.full_name?.charAt(0)}</div>
          <div className="flex flex-col overflow-hidden"><span className="text-sm font-bold truncate">{user.full_name}</span><span className="text-[10px] opacity-50 uppercase tracking-widest">{user.role} Account</span></div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-12">
        <header className="mb-10 flex justify-between items-end text-left">
          <div>
            <h1 className="text-4xl font-black text-[#1B4332] tracking-tight uppercase">Transporter Console</h1>
            <p className="text-gray-500 mt-2 font-medium">Logistics Management for {user.full_name}</p>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="px-6 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Logout</button>
        </header>

        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 min-h-[75vh]">
          {activeTab === 'load_board' && (
            <div className="text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-8">Available Shipments</h2>
              <div className="grid grid-cols-1 gap-6">
                {availableLoads.length > 0 ? availableLoads.map((load) => (
                  <div key={load.id} className="p-8 border border-gray-100 rounded-[30px] bg-[#F9FBFA] flex items-center justify-between hover:border-[#D4AF37] transition-all">
                    <div className="flex gap-12">
                      <div><p className={labelStyle}>Route</p><p className="font-bold text-[#1B4332]">{load.origin} ➔ {load.destination}</p></div>
                      <div><p className={labelStyle}>Cargo</p><p className="font-bold text-[#1B4332]">{load.material} ({load.weight})</p></div>
                      <div><p className={labelStyle}>Payout</p><p className="font-black text-[#10b981]">PKR {load.price.toLocaleString()}</p></div>
                    </div>
                    <button onClick={() => handleAcceptLoad(load.id)} className="px-8 py-3 bg-[#1B4332] text-white rounded-2xl font-bold hover:bg-[#D4AF37] hover:text-[#1B4332] transition-all">Accept Load</button>
                  </div>
                )) : <p className="text-gray-400 italic py-20 text-center">No available loads.</p>}
              </div>
            </div>
          )}

          {activeTab === 'active_trips' && (
            <div className="text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-8">Active Trips</h2>
              <div className="grid grid-cols-1 gap-6">
                {myTrips.length > 0 ? myTrips.map((trip) => (
                  <div key={trip.id} className="p-8 border border-gray-100 rounded-[30px] bg-white shadow-lg text-left">
                    <div className="flex justify-between items-center mb-6">
                        <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full ${trip.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' : trip.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{trip.status.replace("_", " ")}</span>
                        <p className="font-black text-[#10b981]">PKR {trip.price.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><p className={labelStyle}>Origin</p><p className="font-bold text-[#1B4332]">{trip.origin}</p></div>
                        <div><p className={labelStyle}>Destination</p><p className="font-bold text-[#1B4332]">{trip.destination}</p></div>
                        <div className="col-span-2"><p className={labelStyle}>Cargo</p><p className="font-bold text-[#1B4332]">{trip.material} ({trip.weight})</p></div>
                    </div>
                    
                    {trip.status === 'ACCEPTED' && (
                        <div className="flex gap-4">
                            <input type="text" placeholder="Enter Pickup PIN (from Seller)" className="flex-1 p-3 rounded-xl border border-gray-200 outline-none" value={pinInput[trip.id] || ''} onChange={e => setPinInput({...pinInput, [trip.id]: e.target.value})} />
                            <button onClick={() => handleStartJourney(trip.id)} className="px-6 py-3 bg-[#1B4332] text-white rounded-xl font-bold">Start Journey</button>
                        </div>
                    )}
                    {trip.status === 'IN_TRANSIT' && (
                        <div className="flex gap-4">
                            <input type="text" placeholder="Enter Delivery PIN (from Buyer)" className="flex-1 p-3 rounded-xl border border-gray-200 outline-none" value={pinInput[trip.id] || ''} onChange={e => setPinInput({...pinInput, [trip.id]: e.target.value})} />
                            <button onClick={() => handleVerifyDelivery(trip.id)} className="px-6 py-3 bg-[#1B4332] text-white rounded-xl font-bold">Finish Delivery</button>
                        </div>
                    )}
                  </div>
                )) : <p className="text-gray-400 italic py-20 text-center">No active trips.</p>}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
             <div className="py-20 text-center"><h3 className="text-2xl font-black text-[#1B4332]">Earnings automatically credited</h3><p className="text-gray-400 mt-2">Funds are released upon successful delivery verification.</p></div>
          )}
          
          {activeTab === 'profile' && (
            <div className="max-w-4xl text-left animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-[#1B4332] text-[#D4AF37] flex items-center justify-center text-3xl font-black uppercase">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#1B4332]">{user.full_name}</h2>
                    <p className="text-[#D4AF37] font-bold uppercase text-[10px] tracking-[0.2em]">Active Logistics Profile</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <button onClick={handleUpdateProfile} className="px-5 py-2 bg-[#1B4332] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
                      Save Changes
                    </button>
                  )}
                  <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-[#1B4332] hover:bg-gray-50">
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100">
                  <p className={labelStyle}>Full Name / Company</p>
                  {isEditing ? (
                    <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
                      className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" />
                  ) : (
                    <p className="text-xl font-bold text-[#1B4332] mt-1">{user.full_name}</p>
                  )}
                </div>

                <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100 opacity-80">
                  <p className={labelStyle}>Contact Email (Read Only)</p>
                  <p className="text-xl font-bold text-[#1B4332] mt-1">{user.email}</p>
                </div>

                <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100">
                  <p className={labelStyle}>Contact Phone</p>
                  {isEditing ? (
                    <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                      className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" />
                  ) : (
                    <p className="text-xl font-bold text-[#1B4332] mt-1">{user.phone}</p>
                  )}
                </div>

                <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100">
                  <p className={labelStyle}>Operations Base</p>
                  {isEditing ? (
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                      className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" />
                  ) : (
                    <p className="text-xl font-bold text-[#1B4332] mt-1">{user.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}