"use client";
import React, { useState } from 'react';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(''); // To show "Success" or "Error"
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Farmer',
    location: '',
    password: ''
  });

  const isFormValid = formData.fullName && formData.email.includes('@') && formData.password.length >= 8;

  // --- NEW: THE HANDSHAKE FUNCTION ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Loading...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Success! Account Created.');
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.detail}`);
      }
    } catch (error) {
      setStatus('Could not connect to the server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#1B4332] rounded-full flex items-center justify-center text-2xl mb-4">
            <span className="text-[#D4AF37]">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4332]">Create Account</h1>
          {status && <p className={`text-sm mt-2 font-bold ${status.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>{status}</p>}
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          {/* Inputs stay exactly the same as before, just updating the values */}
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Full Name</label>
            <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Mohammad Musarif" 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Email Address</label>
            <input type="email" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Your Role</label>
              <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none" onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option>Farmer</option><option>Miller</option><option>Transporter</option><option>Buyer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Location</label>
              <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="Hamzabad"
                onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button 
  type="submit" 
  onClick={() => console.log("Button clicked!")} // This will show in the Inspect Console
  disabled={!isFormValid} 
  className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg mt-6 ${
    isFormValid 
      ? 'bg-[#1B4332] text-white cursor-pointer' 
      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
  }`}
>
  {status === 'Loading...' ? 'Processing...' : 'Get Started'}
</button>
          
        </form>
      </div>
    </div>
  );
}