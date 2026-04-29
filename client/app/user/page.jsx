'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserDashboard from '../../../user/core/UserDashboard';

export default function User() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (!token || (role !== 'user' && role !== 'admin')) { // Admins can view user page too
      router.push('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null;
  return <UserDashboard />;
}
