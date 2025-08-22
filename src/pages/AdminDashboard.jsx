
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Package, ShoppingBag, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminOrderManagement from '@/components/admin/AdminOrderManagement';
import AdminProductManagement from '@/components/admin/AdminProductManagement';
import AdminCategoryManagement from '@/components/admin/AdminCategoryManagement';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    const getTabButtonClass = (tabName) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
            activeTab === tabName ? 'bg-[#0EB8E1] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`;

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-8"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
                    <Shield size={40} /> Admin Dashboard
                </h1>
            </motion.div>

            <div className="mb-8">
                <div className="glass-effect p-2 sm:p-4 rounded-xl inline-flex flex-wrap gap-2">
                    <button onClick={() => setActiveTab('orders')} className={getTabButtonClass('orders')}>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Order Management</span>
                    </button>
                    <button onClick={() => setActiveTab('products')} className={getTabButtonClass('products')}>
                        <Package className="w-5 h-5" />
                        <span>Product Management</span>
                    </button>
                    <button onClick={() => setActiveTab('categories')} className={getTabButtonClass('categories')}>
                        <FolderKanban className="w-5 h-5" />
                        <span>Category Management</span>
                    </button>
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'orders' && <AdminOrderManagement />}
                    {activeTab === 'products' && <AdminProductManagement />}
                    {activeTab === 'categories' && <AdminCategoryManagement />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;