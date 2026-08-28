import './globals.css'

export const metadata = {
  title: 'Trans-Formers Transmission | Dalton, GA',
  description: 'Family-run transmission repair, rebuilding, diagnostics and complete auto repair in Dalton, Georgia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
