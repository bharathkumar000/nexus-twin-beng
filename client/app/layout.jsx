import './globals.css';

export const metadata = {
  title: 'Nexus Twin | Digital Twin',
  description: 'Advanced Urban Governance & Simulation Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
