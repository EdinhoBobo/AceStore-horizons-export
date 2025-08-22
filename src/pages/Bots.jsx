
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Bots = () => {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { toast } = useToast();

    useEffect(() => {
        const fetchBots = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', 'bots')
                .order('price_in_cents', { ascending: true });

            if (error) {
                toast({ variant: 'destructive', title: 'Error fetching bots', description: error.message });
            } else {
                // Manually define features for display as they are not in DB
                const botFeatures = {
                    '⚔️ AceBot: Juggernaut ⚔️': [
                        'Automatically wins Juggernaut battles',
                        'Precisely detonates bombs during war',
                        'Periodically restarts the game to avoid detection for extended uptime',
                        'Free updates and lifetime support',
                        'Farms Credits, Influence, and Legendary Rank with ease',
                        'Automatically levels up the Battlepass to the max',
                        '💤 Reliable farming even while you sleep',
                    ],
                    '🔥 AceBot PRO': [
                        'Automatically replies to admins/mods to avoid bans',
                        '🌐 Reconnects after internet drops',
                        '⚙️ Auto-rejoin with error detection and recovery',
                        '🎯 Optimized intelligence for better efficiency, faster results, and higher scores',
                        '📦 Full access to all future updates and new releases',
                    ],
                };
                
                const botsWithFeatures = data.map(bot => ({
                    ...bot,
                    features: botFeatures[bot.name] || [],
                    includesBasic: bot.name === '🔥 AceBot PRO',
                }));
                setBots(botsWithFeatures);
            }
            setLoading(false);
        };
        fetchBots();
    }, [toast]);

    const handleAddToCart = (bot) => {
        const productForCart = { id: bot.id, title: bot.name, image: bot.image_url, category: bot.category };
        const variantForCart = { id: `${bot.id}-standard`, title: 'Standard', price_in_cents: bot.price_in_cents };
        addToCart(productForCart, variantForCart, 1);
        toast({
            title: "Added to Cart!",
            description: `${bot.name} has been added to your shopping cart.`
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-16 h-16 text-white animate-spin" /></div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-bold text-white"
                    style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
                >
                    ⚔️ AceBot Juggernaut ⚔️
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                >
                    Dominate the War with Smart Automation. Reach 50,000 points every war and secure your War Tokens — all while you sleep.
                </motion.p>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {bots.map((bot) => (
                    <motion.div key={bot.id} variants={itemVariants} className="glass-effect rounded-2xl p-8 flex flex-col card-hover">
                        <div className="flex-grow">
                            <img src={bot.image_url} alt={bot.name} className="w-full h-auto rounded-lg mb-6" />
                            <h2 className="text-3xl font-bold text-white text-center mb-2">{bot.name}</h2>
                            <p className="text-4xl font-extrabold text-[#0EB8E1] text-center mb-6">${bot.price_in_cents / 100}</p>

                            <ul className="space-y-3 mb-8">
                                {bot.includesBasic && <li className="text-green-400 font-semibold text-center pb-2">Includes everything from BASIC plus:</li>}
                                {bot.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button onClick={() => handleAddToCart(bot)} className="w-full bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white font-bold py-3 text-lg transition-transform duration-200 hover:scale-105">
                            Purchase
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Bots;
