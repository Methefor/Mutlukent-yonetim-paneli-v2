import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthProvider } from "@/modules/auth/AuthProvider";

export const metadata: Metadata = {
  title: "MİYOP | Mutlukent İş Yönetim Paneli",
  description: "Mutlukent İş Yönetim Paneli (MİYOP)"
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ToastProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
