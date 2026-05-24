import "./globals.css";

export const metadata = {
  title: "Real Rails: Interchange Fee Analytics Terminus",
  description: "High-performance interactive financial infrastructure terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#030712]">
        {children}
      </body>
    </html>
  );
}
