'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../../admin/core/AdminDashboard';

export default function Admin() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
      router.push('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null;
  return <AdminDashboard />;
}
