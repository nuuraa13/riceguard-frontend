import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1B4332]">
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-16 py-5 bg-[#F8F9FA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B4332] rounded-full flex items-center justify-center shadow-md">
            <span className="text-[#D4AF37] text-xl">🌱</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">RiceGuard Connect</span>
        </div>
        
        <div className="hidden md:flex gap-10 text-sm font-semibold text-gray-600">
          <a href="#" className="hover:text-[#1B4332] transition-colors">Features</a>
          <a href="#" className="hover:text-[#1B4332] transition-colors">How It Works</a>
        </div>

        {/* FIXED: Wrap the navigation buttons in Links */}
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-2 border border-gray-400 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2 bg-[#1B4332] text-white rounded-lg font-bold text-sm hover:bg-[#2d5a46] transition-all">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative h-[700px] flex flex-col items-center justify-center text-center px-4">
        {/* Background Image with Green Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1536633100187-05561937538c?q=80&w=2070&auto=format&fit=crop" 
            alt="Rice Terrace" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1B4332]/75 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-5xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="inline-block px-5 py-1 mb-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 backdrop-blur-sm">
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">From Farm to Table, Verified at Every Step</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Rice Supply Chain, <br/>
            <span className="text-[#D4AF37]">Reimagined</span>
          </h1>
          
          <p className="text-gray-200 text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
            Direct connections between farmers, millers, and buyers. AI-verified quality. <br/>
            PIN-secured deliveries. No middlemen.
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex gap-5 justify-center mb-16">
            <Link href="/signup">
              <button className="px-10 py-4 bg-[#D4AF37] text-[#1B4332] font-black rounded-lg hover:scale-105 transition-all shadow-xl text-lg">
                Join the Platform
              </button>
            </Link>
            <Link href="/login">
              <button className="px-10 py-4 bg-white text-[#1B4332] font-bold rounded-lg hover:bg-gray-100 transition-all text-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* --- THE 5 ROLE CARDS --- */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 px-10 max-w-7xl w-full translate-y-12">
          {[
            { role: "Farmer", desc: "List paddy, get verified", icon: "🌱" },
            { role: "Transporter", desc: "Confirm pickups & drops", icon: "🚛" },
            { role: "Miller", desc: "Buy, mill & sell rice", icon: "🏭" },
            { role: "Shopkeeper", desc: "Source directly from mill", icon: "🛍️" },
            { role: "Exporter", desc: "Bulk purchase for export", icon: "🌐" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex flex-col items-center text-center group hover:bg-white hover:-translate-y-2 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-[#1B4332]/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold text-[#1B4332] text-lg">{item.role}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="pt-40 pb-24 bg-white px-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl font-bold mb-6">Integrated Platform Features</h2>
          <p className="text-gray-500 text-lg">Every tool you need to run a transparent, profitable rice supply chain</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { title: "AI Quality Check", icon: "🌾", desc: "Automated grain L/B ratio verification ensures only premium rice reaches buyers" },
            { title: "4-Digit PIN Handshake", icon: "🛡️", desc: "Secure delivery confirmation at every transfer point — no disputes, full accountability" },
            { title: "Live Market Prices", icon: "📊", desc: "Real-time rice price graphs so farmers know when to sell for maximum profit" },
            { title: "Full Traceability", icon: "✅", desc: "Every grain tracked from farm to factory to shop with a transparent order timeline" }
          ].map((feature, idx) => (
            <div key={idx} className="p-10 rounded-[2rem] border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1B4332] text-white py-20 px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-xs font-bold">🌱</div>
              <span className="text-xl font-bold">RiceGuard Connect</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Transparent rice supply chain from farm to table.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="text-gray-400 text-sm space-y-3"><li>Home</li><li>Features</li></ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Community</h4>
            <ul className="text-gray-400 text-sm space-y-3"><li>Farmers</li><li>Millers</li></ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="text-gray-400 text-sm space-y-3"><li>Help Center</li><li>Contact Us</li></ul>
          </div>
        </div>
      </footer>
    </div>
  );
}