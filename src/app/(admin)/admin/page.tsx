import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions';
import { getAdminDashboardData } from './actions';
import { AdminDashboardClient } from '@/components/feature/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const { stats, users, coaches, orders } = await getAdminDashboardData();

  return (
    <AdminDashboardClient
      stats={stats}
      initialUsers={users}
      initialCoaches={coaches}
      orders={orders}
    />
  );
}
