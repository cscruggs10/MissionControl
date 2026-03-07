import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import type { Metadata, Viewport } from 'next';

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
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
