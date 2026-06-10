import Header from './Header';
import { useCartCount } from '../../context/CartContext';

export default function Layout({ children }) {
  const cartCount = useCartCount();

  return (
    <div className="min-h-screen bg-[#050b14] text-[#e6edf5] transition-colors duration-300">
      {/* Floating ambient particles */}
      <div className="bg-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="bg-particle" style={{
            left: `${(i * 37 + 11) % 100}%`,
            width: `${24 + (i % 5) * 48}px`,
            height: `${24 + (i % 5) * 48}px`,
            animationDuration: `${18 + (i % 7) * 5}s`,
            animationDelay: `${-i * 2.7}s`,
          }} />
        ))}
      </div>

      {/* Grid lines */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `
          linear-gradient(rgba(0,102,255,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,102,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10">
        <Header cartCount={cartCount} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-white/[0.04] mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676] animate-pulse" />
                <span className="text-[11px] font-medium tracking-wide text-[#7a8ba0]">
                  SkyTrack Flight Radar v2.0
                </span>
              </div>
              <div className="flex items-center gap-6 text-[11px] text-[#7a8ba0]">
                <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#3399ff] transition-colors">OpenSky Network</a>
                <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#3399ff] transition-colors">OpenStreetMap</a>
                <span className="text-white/10">|</span>
                <span>© 2026 SkyTrack</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
