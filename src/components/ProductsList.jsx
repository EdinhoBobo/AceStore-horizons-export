
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import ProductDetailModal from './ProductDetailModal';
import { supabase } from '@/lib/customSupabaseClient';

const ProductsList = ({ filters }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('is_active', true).neq('category', 'bots');

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.subcategory && filters.subcategory !== 'all') {
        query = query.eq('subcategory', filters.subcategory);
      }

      const { data, error } = await query;

      if (error) {
        toast({ variant: 'destructive', title: 'Error fetching products', description: error.message });
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [filters, toast]);

  const handleAddToCart = (product) => {
    // For shop products, we create a default variant on the fly
    const variant = { id: `${product.id}-default`, title: 'Standard', price_in_cents: product.price_in_cents };
    const cartProduct = { id: product.id, title: product.name, image: product.image_url, category: product.category };
    
    addToCart(cartProduct, variant, 1, 999);
    
    toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-center py-16 glass-effect rounded-lg flex flex-col items-center justify-center h-full"
      >
        <Package className="w-24 h-24 text-gray-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">No Products Found</h2>
        <p className="text-gray-400">Try adjusting your search or filters.</p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="glass-effect rounded-xl overflow-hidden card-hover group flex flex-col"
          >
            <div className="aspect-square overflow-hidden relative cursor-pointer" onClick={() => handleImageClick(product)}>
              <img src={product.image_url || 'https://placehold.co/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-white mb-2 flex-grow">{product.name}</h3>
              <div className="flex justify-between items-center mt-4">
                <p className="text-2xl font-bold text-[#0EB8E1]">${(product.price_in_cents / 100).toFixed(2)}</p>
                <Button onClick={() => handleAddToCart(product)} size="icon" className="bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
};

export default ProductsList;
