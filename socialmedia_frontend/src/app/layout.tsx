import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'SocialApp — Connect & Share',
  description: 'A modern social media platform to connect and share with people you care about.',
  keywords: ['social media', 'posts', 'sharing', 'community'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #d1fae5',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 4px 20px rgba(22, 163, 74, 0.12)',
              },
              success: {
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
