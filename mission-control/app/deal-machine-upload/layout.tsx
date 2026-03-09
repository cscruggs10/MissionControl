import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Deal Machine - Upload Video",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deal Machine",
  },
};

export default function DealMachineUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
