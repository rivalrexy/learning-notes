import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import SessionProvider from "@/app/components/SessionProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BelajarKu - Catatan Belajar",
  description: "Aplikasi catatan belajar harian dan mingguan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors`}>
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
