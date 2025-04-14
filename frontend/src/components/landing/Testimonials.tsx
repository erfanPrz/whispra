import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Whispra helped me get honest feedback from my team. The AI moderation keeps the messages constructive and meaningful.",
    author: "Sarah Johnson",
    role: "Team Lead",
    company: "TechCorp",
  },
  {
    quote: "I love how I can filter messages by emotion. It helps me focus on the positive feedback when I need it most.",
    author: "Michael Chen",
    role: "Content Creator",
    company: "Creative Studio",
  },
  {
    quote: "The real-time delivery to Telegram is seamless. I get my messages instantly and can respond quickly.",
    author: "Emma Davis",
    role: "Community Manager",
    company: "Social Media Agency",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-xl text-gray-600">Hear from our satisfied users</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-2xl shadow-lg"
            >
              <p className="text-lg text-gray-700 mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-gray-600 text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 