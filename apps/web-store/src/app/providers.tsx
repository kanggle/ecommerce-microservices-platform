'use client';

import { AuthProvider } from '@/features/auth';
import { CartProvider } from '@/features/cart';
import { ProfileImageProvider } from '@/shared/context/ProfileImageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ProfileImageProvider>{children}</ProfileImageProvider>
      </CartProvider>
    </AuthProvider>
  );
}
