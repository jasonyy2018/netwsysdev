import React from 'react';
import { getAdminDashboardData } from './actions';
import { AdminDashboardClient } from '@/components/feature/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
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
