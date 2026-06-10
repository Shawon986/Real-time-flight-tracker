import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { CartProvider } from './context/CartContext';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/layout/Layout';

// Lazy-load pages for code splitting
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/ui/LoadingScreen';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const FlightDetailPage = lazy(() => import('./pages/FlightDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));

function PageLoader() {
  return <LoadingScreen message="Loading page..." />;
}

export default function App() {
  const { dark, toggle } = useTheme();
  const location = useLocation();

  return (
    <CartProvider>
      <BookingProvider>
        <Layout dark={dark} onToggleTheme={toggle}>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/flight/:id" element={<FlightDetailPage />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </Layout>
      </BookingProvider>
    </CartProvider>
  );
}
