import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center glass-effect p-10 rounded-xl"
      >
        <CheckCircle className="mx-auto h-24 w-24 text-green-400 mb-6" />
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
        </p>
        <Link to="/shop">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 text-lg">
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Success;