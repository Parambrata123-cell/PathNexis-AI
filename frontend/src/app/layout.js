import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "PathNexis AI — Career Development Platform",
  description: "AI-powered career platform for Tier 3 & Tier 4 students. Resume analyzer, learning roadmaps, alumni network, referral marketplace, and mock interviews.",
  keywords: "career, AI, resume, roadmap, alumni, referral, interview, students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
