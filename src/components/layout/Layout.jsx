import Header from './Header';
import { useCartCount } from '../../context/CartContext';

export default function Layout({ dark, onToggleTheme, children }) {
  const cartCount = useCartCount();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Ambient particles */}
      <div className="bg-particles" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-particle" style={{
            left: `${(i * 41 + 7) % 100}%`,
            width: `${30 + (i%5)*50}px`,
            height: `${30 + (i%5)*50}px`,
            animationDuration: `${16 + (i%6)*7}s`,
            animationDelay: `${-i * 3}s`,
          }} />
        ))}
      </div>

      <div className="relative z-10">
        <Header dark={dark} onToggleTheme={onToggleTheme} cartCount={cartCount} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
