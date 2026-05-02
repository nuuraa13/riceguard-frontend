"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FarmerView from '../components/FarmerDashboard';
import MillerView from '../components/MillerDashboard';
import TransporterView from '../components/TransporterDashboard';
import ShopkeeperView from '../components/ShopkeeperDashboard';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (!savedRole) {
      router.push('/login');
    } else {
      setRole(savedRole.toLowerCase());
    }
  }, [router]);

  if (!role) return <div>Loading...</div>;

  // Show the specific dashboard based on role
  if (role === 'farmer') return <FarmerView />;
  if (role === 'miller') return <MillerView />;
  if (role === 'transporter') return <TransporterView />;
  if (role === 'buyer' || role === 'shopkeeper') return <ShopkeeperView />;
  
  return <div>Role not recognized. Please contact support.</div>;
}