import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart = () => {
    // This is placeholder data. In a real app, this would come from state management.
    const cartItems = [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-bold text-white text-center mb-12"
                    style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
                >
                    Your Cart
                </motion.h1>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-effect rounded-xl p-6 lg:p-8"
                >
                    {cartItems.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingCart className="w-24 h-24 text-gray-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-2">Your cart is empty</h2>
                            <p className="text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
                            <Link to="/shop">
                                <Button className="bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white font-semibold text-lg px-8 py-6">
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {/* This part will be shown when cart has items */}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;