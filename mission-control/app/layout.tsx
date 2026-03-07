import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Agent task coordination",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mission Control",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
