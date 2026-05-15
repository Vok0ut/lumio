import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Lumio",
  description: "Tu sistema de productividad gamificado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumio",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090909",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* PWA / iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
