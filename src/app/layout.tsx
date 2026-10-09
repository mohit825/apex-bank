import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApexBank | Secure Wealth Management Portal",
  description: "Explore ApexBank, a wealth management portal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
