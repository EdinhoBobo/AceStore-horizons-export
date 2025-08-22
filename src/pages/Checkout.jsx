
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingCart, Trash2, Loader2, User, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const Checkout = () => {
    const { cartItems, getCartTotal, removeFromCart, clearCart } = useCart();
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const cartAnalysis = useMemo(() => {
        const containsBot = cartItems.some(item => item.product && item.product.category === 'bots');
        const containsItem = cartItems.some(item => item.product && item.product.category !== 'bots');
        return { containsBot, containsItem };
    }, [cartItems]);

    const checkoutSchema = useMemo(() => {
        return z.object({
          nickname: cartAnalysis.containsItem ? z.string().min(3, "Nickname must be at least 3 characters.") : z.string().optional(),
          discord: cartAnalysis.containsBot ? z.string().min(3, "Discord username must be at least 3 characters.") : z.string().optional(),
        });
    }, [cartAnalysis]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(checkoutSchema)
    });

    const handlePayment = async (data) => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to place an order.",
            });
            navigate('/login');
            return;
        }

        setIsProcessing(true);

        const delivery_info = {};
        if (data.nickname) delivery_info.nickname = data.nickname;
        if (data.discord) delivery_info.discord = data.discord;

        const orderData = {
            user_id: user.id,
            total_amount_cents: getCartTotal(),
            status: 'pending',
            delivery_info: delivery_info,
            metadata: { user_email: user.email }
        };

        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItemsData = cartItems.map(item => ({
                order_id: order.id,
                product_id: String(item.product.id),
                product_name: item.product.title,
                variant_id: String(item.variant.id),
                variant_name: item.variant.title,
                quantity: item.quantity,
                price_per_item_cents: item.variant.price_in_cents
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsData);
            
            if (itemsError) throw itemsError;

            toast({
                title: "🎉 Order Placed!",
                description: "Your order is pending. The admin will process it shortly.",
            });
            clearCart();
            navigate('/account');

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Order Failed",
                description: error.message || "There was a problem placing your order.",
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const inputClass = (hasError) =>
      `mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${hasError ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm`;

    return (
        <div className="container mx-auto max-w-4xl px-4">
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-7xl font-bold text-white text-center mb-12"
                style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
            >
                Checkout
            </motion.h1>
            
            <form onSubmit={handleSubmit(handlePayment)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-effect rounded-xl p-6 flex flex-col"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6" />
                            Your Order
                        </h2>
                        
                        {cartItems.length > 0 ? (
                            <div className="space-y-4 flex-grow">
                                {cartItems.map(item => (
                                    <div key={item.variant.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <img src={item.product.image} alt={item.product.title} className="w-12 h-12 object-cover rounded-md" />
                                            <div>
                                                <p className="font-semibold text-white">{item.product.title}</p>
                                                <p className="text-sm text-gray-400">{item.quantity} x ${((item.variant.price_in_cents ?? 0) / 100).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => removeFromCart(item.variant.id)} size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 flex-grow flex flex-col justify-center items-center">
                                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-400">Your cart is empty.</p>
                                <Link to="/shop" className="mt-4 text-[#0EB8E1] hover:underline">
                                    Continue Shopping
                                </Link>
                            </div>
                        )}
                        
                        <div className="border-t border-white/20 mt-6 pt-4 flex justify-between items-center text-xl font-bold text-white">
                            <span>Total</span>
                            <span>${(getCartTotal() / 100).toFixed(2)}</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="glass-effect rounded-xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Delivery & Payment
                        </h2>
                        <div className="space-y-6">
                            {cartAnalysis.containsItem && (
                                <div>
                                    <label htmlFor="nickname" className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-1">
                                        <User size={14} /> In-Game Nickname
                                    </label>
                                    <input id="nickname" type="text" {...register("nickname")} className={inputClass(errors.nickname)} placeholder="Nickname for item delivery" />
                                    {errors.nickname && <p className="mt-1 text-xs text-red-400">{errors.nickname.message}</p>}
                                </div>
                            )}
                             {cartAnalysis.containsBot && (
                                <div>
                                    <label htmlFor="discord" className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.22,4.42C18.84,3.78,17.38,3.32,15.86,3.06C15.8,3.05,15.74,3.06,15.68,3.1C15.53,3.31,15.42,3.57,15.35,3.85C13.6,3.43,11.89,3.43,10.18,3.85C10.11,3.57,10,3.31,9.85,3.1C9.79,3.06,9.73,3.05,9.67,3.06C8.15,3.32,6.69,3.78,5.31,4.42C5.25,4.44,5.21,4.5,5.2,4.56C3.6,7.83,3.35,11.2,3.92,14.41C3.93,14.48,3.97,14.54,4.03,14.58C5.23,15.47,6.5,16.22,7.85,16.83C7.91,16.85,7.98,16.85,8.04,16.82C8.47,16.58, 8.86,16.3,9.2,15.97C9.25,15.93,9.26,15.87,9.24,15.81C8.8,15.11,8.44,14.36,8.16,13.56C8.14,13.5,8.17,13.43,8.23,13.41C11.39,12.5,14.14,12.5,17.3,13.41C17.36,13.43,17.39,13.5,17.37,13.56C17.09,14.36,16.73,15.11,16.29,15.81C16.27,15.87,16.28,15.93,16.33,15.97C16.67,16.3,17.06,16.58,17.49,16.82C17.55,16.85,17.62,16.85,17.68,16.83C19.03,16.22,20.3,15.47,21.5,14.58C21.56,14.54,21.6,14.48,21.61,14.41C22.18,11.2,21.93,7.83,20.33,4.56C20.32,4.5,20.28,4.44,20.22,4.42ZM13.73,11.35C13.06,11.35,12.5,10.78,12.5,10.1C12.5,9.42,13.06,8.85,13.73,8.85C14.4,8.85,14.96,9.42,14.96,10.1C14.96,10.78,14.4,11.35,13.73,11.35ZM10.5,11.35C9.83,11.35,9.27,10.78,9.27,10.1C9.27,9.42,9.83,8.85,10.5,8.85C11.17,8.85,11.73,9.42,11.73,10.1C11.73,10.78,11.17,11.35,10.5,11.35Z"/></svg> Discord Username
                                    </label>
                                    <input id="discord" type="text" {...register("discord")} className={inputClass(errors.discord)} placeholder="Discord for bot delivery" />
                                    {errors.discord && <p className="mt-1 text-xs text-red-400">{errors.discord.message}</p>}
                                </div>
                            )}

                            <div className="bg-blue-900/30 border border-blue-500/50 text-blue-200 text-sm rounded-lg p-4 flex gap-4">
                                <HelpCircle className="w-8 h-8 flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-bold">How Payments Work:</p>
                                    <p>To accept real payments, integrate Stripe. For now, orders are marked 'pending' for manual admin approval.</p>
                                </div>
                            </div>
                             <Button onClick={() => toast({ title: "🚧 Feature Inactive", description: "Please follow the guide to set up Stripe for payments." })} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 cursor-not-allowed">
                                Pay with Card (Setup Required)
                             </Button>
                             <Button type="submit" className="w-full bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white font-semibold py-3" disabled={cartItems.length === 0 || isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Place Order for Manual Approval'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
