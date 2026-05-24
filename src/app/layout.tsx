import "./globals.css";
import CommandAssistant from "@/components/CommandAssistant";
import CommandPalette from "@/components/CommandPalette";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Braes Creek Estate",
  description: "Farm Finance Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BC Worker",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/bc-logo.png" />
        <meta name="theme-color" content="#22C55E" />
      </head>
      <body>
        <Toaster position="top-right" />
        {children}
        <CommandPalette />
        <CommandAssistant />
      </body>
    </html>
  );
}
