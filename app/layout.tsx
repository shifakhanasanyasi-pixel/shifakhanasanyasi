import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sanyasi Shifa Khana — API',
  description: 'Firebase backend for Sanyasi Shifa Khana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
