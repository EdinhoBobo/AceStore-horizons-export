
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, DollarSign, Clock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const { toast } = useToast();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data);
        } catch (err) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Failed to fetch orders",
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast({
                title: "Order Updated",
                description: `Order #${orderId} has been marked as ${newStatus}.`
            });
            fetchOrders();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: err.message,
            });
        }
    };

    const filteredOrders = orders.filter(order => filter === 'all' || order.status === filter);

    const renderOrders = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 text-white animate-spin" /></div>;
        }

        if (error) {
            return (
                <div className="text-center text-red-400 py-8">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>Error loading orders: {error}</p>
                </div>
            );
        }

        if (filteredOrders.length === 0) {
            return <div className="text-center text-gray-400 py-16">No orders found for this filter.</div>;
        }

        return (
            <div className="space-y-6">
                {filteredOrders.map(order => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                        className="glass-effect rounded-xl p-6"
                    >
                        <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
                                <p className="text-sm text-gray-400">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                   order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                   order.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                   'bg-red-500/20 text-red-300'
                               }`}>{order.status}</span>
                               <span className="text-2xl font-bold text-[#0EB8E1]">
                                   ${((order.total_amount_cents || 0) / 100).toFixed(2)}
                               </span>
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <div className="text-gray-300 mb-2">
                                {order.delivery_info?.nickname && <p><span className="font-semibold text-white">Nickname:</span> {order.delivery_info.nickname}</p>}
                                {order.delivery_info?.discord && <p><span className="font-semibold text-white">Discord:</span> {order.delivery_info.discord}</p>}
                            </div>
                            <p className="text-gray-300 mb-4"><span className="font-semibold text-white">Player Email:</span> {order.metadata?.user_email}</p>
                             <div className="space-y-2 mb-4">
                                <h4 className="font-semibold text-white">Items:</h4>
                                {order.order_items.map(item => (
                                    <div key={item.id} className="bg-white/5 p-2 rounded-md text-sm flex justify-between">
                                        <span>{item.quantity} x {item.product_name} ({item.variant_name})</span>
                                        <span>${((item.price_per_item_cents || 0) / 100).toFixed(2)} each</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {order.status === 'pending' && (
                             <div className="flex gap-4 mt-4">
                                <Button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="bg-green-600 hover:bg-green-700">Mark as Completed</Button>
                                <Button onClick={() => handleUpdateOrderStatus(order.id, 'refunded')} variant="destructive">Mark as Refunded</Button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    };

    const getFilterButtonClass = (filterName) =>
        `px-4 py-2 rounded-lg transition-colors ${filter === filterName ? 'bg-[#0EB8E1] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;

    return (
        <div>
             <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="glass-effect p-2 rounded-xl inline-flex flex-wrap gap-2">
                    <button onClick={() => setFilter('pending')} className={getFilterButtonClass('pending')}>
                        <Clock className="w-4 h-4 mr-2 inline" /> Pending
                    </button>
                     <button onClick={() => setFilter('completed')} className={getFilterButtonClass('completed')}>
                        <CheckCircle className="w-4 h-4 mr-2 inline" /> Completed
                    </button>
                    <button onClick={() => setFilter('refunded')} className={getFilterButtonClass('refunded')}>
                        <DollarSign className="w-4 h-4 mr-2 inline" /> Refunded
                    </button>
                    <button onClick={() => setFilter('all')} className={getFilterButtonClass('all')}>
                        All Orders
                    </button>
                </div>
                 <Button onClick={fetchOrders} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            {renderOrders()}
        </div>
    );
};

export default AdminOrderManagement;
