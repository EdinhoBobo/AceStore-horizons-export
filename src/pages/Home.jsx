
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center flex-grow">
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold text-white text-center mb-16"
                style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
            >
                Ace Store
            </motion.h1>
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="container mx-auto px-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <div className="glass-effect aspect-square rounded-xl p-6 flex flex-col items-center justify-between shadow-glow-hover">
                        <img
                            src="https://horizons-cdn.hostinger.com/234869e4-f518-4a32-bcd3-28c325d66b7c/35096600034b42f79a7012bd47046a90.png"
                            alt="Items Icon"
                            className="w-24 h-24 rounded-full"
                        />
                        <Link to="/shop" className="w-full">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="w-full"
                            >
                                <img
                                    src="https://horizons-cdn.hostinger.com/234869e4-f518-4a32-bcd3-28c325d66b7c/b762016002dbea6935e41eef7c820f4b.png"
                                    alt="Items"
                                    className="h-auto w-4/5 mx-auto"
                                />
                            </motion.div>
                        </Link>
                    </div>
                    <div className="glass-effect aspect-square rounded-xl p-6 flex flex-col items-center justify-between shadow-glow-hover">
                        <img
                            src="https://horizons-cdn.hostinger.com/234869e4-f518-4a32-bcd3-28c325d66b7c/52e4ed54d54cd69a48d42cf8193287ce.png"
                            alt="Bots Icon"
                            className="w-24 h-24 rounded-full"
                        />
                        <Link to="/bots" className="w-full">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="w-full"
                            >
                                <img
                                    src="https://horizons-cdn.hostinger.com/234869e4-f518-4a32-bcd3-28c325d66b7c/378b9d1adf135479adbb7999f08e3e98.png"
                                    alt="Bots"
                                    className="h-auto w-4/5 mx-auto transform scale-[1.023]"
                                />
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
