import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "CRLSpen",
  description: "Lets students check their grades and GPA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} >
        {children}
        <a href="/about" className="about-link">About CRLSpen</a>
      </body>
    </html>
  );
}
