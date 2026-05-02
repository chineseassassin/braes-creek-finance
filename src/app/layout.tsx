import "./globals.css";
import CommandAssistant from "@/components/CommandAssistant";
import CommandPalette from "@/components/CommandPalette";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Braes Creek Estate",
  description: "Farm Finance Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
        <CommandPalette />
        <CommandAssistant />
      </body>
    </html>
  );
}
