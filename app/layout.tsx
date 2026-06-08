import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thrivo Admin",
  description: "Admin dashboard for Thrivo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light text-dark">
        <nav className="bg-primary text-white p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Thrivo Admin</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
