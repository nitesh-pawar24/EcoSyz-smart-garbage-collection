import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'EcoSyz - Smart Waste Management System',
  description: 'Admin Dashboard for EcoSyz Smart Garbage Collection',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-mesh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
