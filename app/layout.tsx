import './globals.css';

export const metadata = {
  title: 'ROTA — İş Akışı Sistemi',
  description: 'Reklam ajansı iş akışı yönetimi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
