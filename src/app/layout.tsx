import { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Actions GH-200 - Simulador de Certificação',
  description: 'Simulador interativo para a certificação GitHub Actions GH-200. Pratique com questões reais e prepare-se para o exame.',
  keywords: ['GitHub Actions', 'GH-200', 'certificação', 'simulador', 'exame', 'prática'],
  authors: [{ name: 'Simulador GH-200' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
