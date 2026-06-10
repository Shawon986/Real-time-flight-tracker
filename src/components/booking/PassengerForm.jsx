import { motion } from 'framer-motion';

export default function PassengerForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const fields = [
    { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
    { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555-0123' },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    { key: 'passport', label: 'Passport Number', type: 'text', placeholder: 'AB123456' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            {field.label}
          </label>
          <input
            type={field.type}
            value={data[field.key] || ''}
            onChange={e => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all duration-200"
          />
        </div>
      ))}
    </motion.div>
  );
}
