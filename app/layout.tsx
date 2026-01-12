import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2D to Merch Design Studio",
  description: "Transform your 2D objects into beautiful merchandise designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
