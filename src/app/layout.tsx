import type {Metadata} from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Toaster } from "@/components/ui/toaster";
import IframeResizer from "@/components/IframeResizer";

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['400', '700', '900'], // Include weights needed
});

export const metadata: Metadata = {
  title: 'Martinique Estimator Widget',
  description: 'Estimate property value and revenue in Martinique',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${workSans.variable} antialiased font-sans text-base font-normal leading-normal text-black`}>
        {children}
        <Toaster />
        <IframeResizer /> 
      </body>
    </html>
  );
}
