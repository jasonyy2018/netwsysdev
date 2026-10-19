import React from 'react';
import { getCurrentUser } from '@/app/(auth)/actions';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const user = await getCurrentUser();
  return <NavbarClient user={user} />;
}
