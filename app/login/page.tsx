"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('Verifying...');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      setStatus('Success! Redirecting...');
      
      // 1. Store the Name (for the "Welcome" message)
      localStorage.setItem('userName', data.user.fullName);
      
      // 2. CRITICAL: Store the Role (so the Dashboard doesn't redirect you back here)
      // Make sure your backend returns "role" inside the "user" object
      localStorage.setItem('userRole', data.user.role); 

      // 3. Store the entire user object for Dashboards
      localStorage.setItem('user', JSON.stringify(data.user));

      // 4. Redirect after a short delay
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      // Use the 'data' we already parsed above
      setStatus(`Error: ${data.detail || 'Invalid credentials'}`);
    }
  } catch (error) {
    console.error("Login Error:", error);
    setStatus('Server connection failed.');
  }
};
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#1B4332] rounded-full flex items-center justify-center text-2xl mb-4">
            <span className="text-[#D4AF37]">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4332]">Welcome Back</h1>
          {status && <p className={`text-sm mt-2 font-bold ${status.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>{status}</p>}
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Email Address</label>
            <input type="email" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1B4332] transition-colors" 
              placeholder="name@example.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Password</label>
            <input type="password" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1B4332] transition-colors" 
              placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <button className="w-full py-4 bg-[#1B4332] text-white font-bold rounded-2xl hover:bg-[#143326] transition-all shadow-lg mt-4">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account? <a href="/signup" className="text-[#1B4332] font-bold hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}