import { motion } from 'framer-motion';

const ADDONS = [
  { key: 'checkedBag', label: 'Checked Baggage', desc: '23kg / 50lb bag', price: 35, icon: '🧳' },
  { key: 'priority', label: 'Priority Boarding', desc: 'Board first, settle in', price: 25, icon: '⚡' },
  { key: 'meal', label: 'Premium Meal', desc: 'Chef-curated in-flight dining', price: 18, icon: '🍽️' },
  { key: 'wifi', label: 'In-Flight WiFi', desc: 'High-speed connectivity', price: 12, icon: '📶' },
  { key: 'extraLegroom', label: 'Extra Legroom', desc: '+6 inches of space', price: 55, icon: '🦵' },
  { key: 'lounge', label: 'Airport Lounge', desc: 'Pre-flight lounge access', price: 40, icon: '🥂' },
];

export default function AddOnsSelector({ selected = [], onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {ADDONS.map(addon => {
        const isSelected = selected.includes(addon.key);
        return (
          <motion.button
            key={addon.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(addon.key)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
              ${isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-lg shadow-primary-500/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <span className="text-2xl">{addon.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{addon.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{addon.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400">+${addon.price}</p>
              <div className={`w-5 h-5 rounded border-2 mx-auto mt-1 flex items-center justify-center transition-colors
                ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                {isSelected && <span className="text-white text-[10px]">✓</span>}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function getAddOnsTotal(selectedKeys) {
  return selectedKeys.reduce((sum, key) => {
    const addon = ADDONS.find(a => a.key === key);
    return sum + (addon ? addon.price : 0);
  }, 0);
}
