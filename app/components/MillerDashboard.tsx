"use client";
import React, { useState, useEffect } from 'react';

interface RiceListing {
  id: string;
  variety: string;
  farmerName: string;
  ownerEmail: string;
  location: string;
  phone: string;
  quantity: number;
  price: number;
  lbRatio: number;
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
  delivery_pin: string | null;
}

export default function MillerDashboard() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [availablePaddy, setAvailablePaddy] = useState<RiceListing[]>([]);
  const [myOrders, setMyOrders] = useState<Shipment[]>([]);
  const [millerWallet, setMillerWallet] = useState({ locked: 0, available: 0 });
  const [buyQuantity, setBuyQuantity] = useState<{ [key: string]: string }>({});
  
  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    location: "",
    phone: "",
    role: "miller"
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
      const parsedUser = JSON.parse(storedUser);
      const userData = {
        full_name: parsedUser.full_name || parsedUser.fullName || parsedUser.username || "Miller",
        username: parsedUser.username || "N/A",
        email: parsedUser.email || "No Email",
        location: parsedUser.location || "Not Specified",
        phone: parsedUser.phone || "No Phone",
        role: parsedUser.role || "miller"
      };
      setUser(userData);
      setEditForm({
        full_name: userData.full_name,
        phone: userData.phone,
        location: userData.location
      });
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const resListings = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/all-listings`);
      if (resListings.ok) setAvailablePaddy(await resListings.json());

      if (user.email && user.email !== "No Email") {
        const resStats = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/user-stats?email=${user.email}`);
        if (resStats.ok) {
          const statsData = await resStats.json();
          setMillerWallet({ locked: statsData.locked_balance || 0, available: statsData.balance || 0 });
        }
        
        const resOrders = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/my-shipments?email=${user.email}&role=miller`);
        if (resOrders.ok) setMyOrders(await resOrders.json());
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDashboardData();
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
      }
    } catch (err) { alert("Error updating profile."); }
  };

  const handleBuy = async (listing: RiceListing) => {
    const qty = parseFloat(buyQuantity[listing.id] || "0");
    if (!qty || qty <= 0 || qty > listing.quantity) {
      alert("Please enter a valid quantity.");
      return;
    }
    const transport_price = qty * 1000;
    
    if (millerWallet.available < (qty * listing.price) + transport_price) {
        alert("Insufficient balance.");
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/buy-rice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_email: user.email,
          quantity: qty,
          transport_price: transport_price
        })
      });
      if (res.ok) {
        alert("Purchase successful!");
        fetchDashboardData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) { alert("Error processing purchase."); }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F6]">
      <aside className="w-64 bg-[#1B4332] text-white flex flex-col p-6 fixed h-full shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-xl">🌱</div>
          <span className="text-xl font-bold tracking-tight text-left">RiceGuard</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[ { id: 'marketplace', icon: '🛒', label: 'Marketplace' }, { id: 'orders', icon: '📋', label: 'Logistics' }, { id: 'wallet', icon: '💼', label: 'Wallet Balance' }, { id: 'profile', icon: '👤', label: 'My Profile' } ].map((tab) => (
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
          <div><h1 className="text-4xl font-black text-[#1B4332] tracking-tight uppercase">Miller Console</h1><p className="text-gray-500 mt-2 font-medium">Monitoring Operations for {user.full_name}</p></div>
          <button onClick={() => { localStorage.removeItem("user"); window.location.href = "/"; }} className="px-6 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Logout</button>
        </header>

        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 min-h-[75vh]">
          {activeTab === 'profile' && (
            <div className="max-w-4xl text-left animate-in fade-in duration-500">
                {/* Profile UI (same as before) */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-[#1B4332] text-[#D4AF37] flex items-center justify-center text-3xl font-black uppercase">{user.full_name?.charAt(0)}</div>
                        <div><h2 className="text-3xl font-black text-[#1B4332]">{user.full_name}</h2><p className="text-[#D4AF37] font-bold uppercase text-[10px] tracking-[0.2em]">Active Miller Profile</p></div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing && <button onClick={handleUpdateProfile} className="px-5 py-2 bg-[#1B4332] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">Save Changes</button>}
                        <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-[#1B4332] hover:bg-gray-50">{isEditing ? "Cancel" : "Edit Profile"}</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100"><p className={labelStyle}>Full Name</p>{isEditing ? <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" /> : <p className="text-xl font-bold text-[#1B4332] mt-1">{user.full_name}</p>}</div>
                    <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100 opacity-80"><p className={labelStyle}>Business Email</p><p className="text-xl font-bold text-[#1B4332] mt-1">{user.email}</p></div>
                    <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100"><p className={labelStyle}>Contact Phone</p>{isEditing ? <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" /> : <p className="text-xl font-bold text-[#1B4332] mt-1">{user.phone}</p>}</div>
                    <div className="p-8 bg-[#F9FBFA] rounded-[30px] border border-gray-100"><p className={labelStyle}>Facility Region</p>{isEditing ? <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full mt-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] font-bold text-[#1B4332]" /> : <p className="text-xl font-bold text-[#1B4332] mt-1">{user.location}</p>}</div>
                </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-8 text-left">Paddy Market</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availablePaddy.map((item) => (
                  <div key={item.id} className="p-8 border border-gray-100 rounded-[40px] bg-[#F9FBFA] hover:shadow-xl transition-all text-left">
                    <div className="flex justify-between items-start mb-4"><span className="px-3 py-1 bg-white text-[#1B4332] text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-widest">{item.variety}</span><span className="text-xs font-bold text-gray-500">{item.quantity} Tons left</span></div>
                    <div className="mb-6 space-y-2"><div className="flex justify-between items-center"><span className={labelStyle}>Seller</span><span className="font-bold text-sm">{item.farmerName}</span></div><div className="flex justify-between items-center"><span className={labelStyle}>Price/Ton</span><span className="font-black text-sm text-[#1B4332]">PKR {item.price.toLocaleString()}</span></div></div>
                    <div className="flex gap-2"><input type="number" placeholder="Tons" max={item.quantity} className="w-24 p-3 rounded-xl border border-gray-200 outline-none" value={buyQuantity[item.id] || ''} onChange={e => setBuyQuantity({...buyQuantity, [item.id]: e.target.value})} /><button onClick={() => handleBuy(item)} className="flex-1 py-3 bg-[#1B4332] text-white rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#1B4332] transition-all">Buy Now</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="max-w-4xl mx-auto text-left">
               <div className="bg-[#1B4332] p-12 rounded-[40px] text-white shadow-xl mb-8"><div className="grid grid-cols-2 gap-8 text-left"><div><p className={labelStyle}>Spending Balance</p><p className="text-4xl font-black text-green-400">Rs {millerWallet.available.toLocaleString()}</p></div><div><p className={labelStyle}>Escrow Locked</p><p className="text-4xl font-black text-[#D4AF37]">Rs {millerWallet.locked.toLocaleString()}</p></div></div></div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="text-left">
              <h2 className="text-2xl font-bold text-[#1B4332] mb-8">Shipment Logistics</h2>
              <div className="grid grid-cols-1 gap-6">
                {myOrders.length > 0 ? myOrders.map((order) => (
                  <div key={order.id} className="p-8 border border-gray-100 rounded-[30px] bg-white shadow-lg text-left">
                    <div className="flex justify-between items-center mb-6"><span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full ${order.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' : order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{order.status.replace("_", " ")}</span><p className="font-black text-[#10b981]">Cost: PKR {order.price.toLocaleString()}</p></div>
                    <div className="grid grid-cols-2 gap-4 mb-6"><div><p className={labelStyle}>Origin</p><p className="font-bold text-[#1B4332]">{order.origin}</p></div><div><p className={labelStyle}>Destination</p><p className="font-bold text-[#1B4332]">{order.destination}</p></div><div className="col-span-2"><p className={labelStyle}>Cargo</p><p className="font-bold text-[#1B4332]">{order.material} ({order.weight})</p></div></div>
                    
                    {/* PIN Display Logic */}
                    {order.pickup_pin && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-2">
                            <p className="text-sm text-yellow-700 mb-1 font-bold">Pickup PIN (Give to Driver)</p>
                            <p className="text-3xl font-black tracking-[0.5em] text-yellow-900">{order.pickup_pin}</p>
                        </div>
                    )}
                    {order.delivery_pin && order.status === 'IN_TRANSIT' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-sm text-blue-700 mb-1 font-bold">Delivery PIN (Driver will ask for this)</p>
                            <p className="text-3xl font-black tracking-[0.5em] text-blue-900">{order.delivery_pin}</p>
                        </div>
                    )}
                  </div>
                )) : <p className="text-gray-400 italic py-20 text-center">No active shipments.</p>}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}