import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
