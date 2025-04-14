import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '✨',
    title: 'AI-powered moderation',
    description: 'Advanced AI filters to keep messages meaningful and appropriate.',
  },
  {
    icon: '💬',
    title: 'Emotion filters',
    description: 'Filter messages by emotional tone to match your mood.',
  },
  {
    icon: '🚀',
    title: 'Real-time delivery',
    description: 'Messages are delivered instantly to your Telegram chat.',
  },
  {
    icon: '🔒',
    title: 'Spam protection',
    description: 'Advanced algorithms to prevent spam and troll messages.',
  },
  {
    icon: '🎨',
    title: 'Personalized themes',
    description: 'Customize how your messages appear with different themes.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600">Everything you need to receive meaningful anonymous messages</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 