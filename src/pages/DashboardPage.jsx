import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useBookings } from '../context/BookingContext';
import { MOCK_FLIGHTS } from '../services/mockFlights';
import PageTransition from '../components/ui/PageTransition';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { staggerContainer, staggerItem } from '../utils/animations';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function DashboardPage() {
  const bookings = useBookings();

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalSpent = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.price || 0), 0);
    const totalMiles = bookings.filter(b => b.status !== 'cancelled').length * 3487; // rough avg miles per flight
    const points = Math.floor(totalSpent * 5);

    // Monthly booking chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(m => ({ name: m, bookings: Math.floor(Math.random() * 8) + (m === months[new Date().getMonth()] ? 5 : 0) }));

    // Airline distribution
    const airlineCounts = {};
    bookings.forEach(b => {
      if (b.status !== 'cancelled') airlineCounts[b.airline] = (airlineCounts[b.airline] || 0) + 1;
    });
    const airlineData = Object.entries(airlineCounts).map(([name, value]) => ({ name, value }));

    // Spending trend (last 6 months)
    const spendTrend = months.slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1).map(m => ({
      name: m,
      spent: Math.floor(Math.random() * 2000) + 500,
    }));

    return { totalBookings, totalSpent, totalMiles, points, monthlyData, airlineData, spendTrend };
  }, [bookings]);

  const recentBookings = bookings.slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Dashboard</h2>

        {/* Stats row */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Flights Booked', value: stats.totalBookings, icon: '✈️', color: 'from-blue-500 to-blue-700' },
            { label: 'Miles Traveled', value: stats.totalMiles, suffix: '', icon: '🌍', color: 'from-purple-500 to-purple-700' },
            { label: 'Total Spent', value: stats.totalSpent, prefix: '$', icon: '💰', color: 'from-emerald-500 to-emerald-700' },
            { label: 'Loyalty Points', value: stats.points, icon: '⭐', color: 'from-amber-500 to-amber-700' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-xl`}
            >
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-2xl sm:text-3xl font-black">
                <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
              </p>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} animationBegin={300} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Spending trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.spendTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="spent" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} animationBegin={300} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Airline distribution pie + Recent bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Airlines Flown</h3>
            {stats.airlineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.airlineData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} animationBegin={300} animationDuration={1200}>
                    {stats.airlineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No booking data yet</div>
            )}
          </motion.div>

          {/* Recent bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Bookings</h3>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{b.flightNum}</p>
                      <p className="text-xs text-gray-400">{b.from} → {b.to} • {b.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">${b.price}</p>
                      <span className={`text-[10px] font-semibold uppercase ${b.status === 'confirmed' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {b.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                No bookings yet. Start by booking a flight!
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
