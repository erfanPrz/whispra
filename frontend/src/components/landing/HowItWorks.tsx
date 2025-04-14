import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Get your Whispra link',
    description: 'Connect with Telegram and receive your unique anonymous messaging link.',
    icon: '🔗',
  },
  {
    title: 'Share it anywhere',
    description: 'Share your link on social media, with friends, or anywhere you want to receive messages.',
    icon: '📤',
  },
  {
    title: 'Receive messages',
    description: 'Get anonymous messages delivered directly to your Telegram chat.',
    icon: '📨',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to start receiving anonymous messages</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-lg"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 