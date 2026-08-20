import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../component/Navbar";

export const metadata = {
  title: "EcoSyz - Smart Waste Management System",
  description: "Community-driven smart garbage collection, monitoring, and waste management platform",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased text-gray-900">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
