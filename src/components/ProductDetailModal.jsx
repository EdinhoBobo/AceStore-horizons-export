
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';

const ProductDetailModal = ({ product, isOpen, setIsOpen }) => {
    const { toast } = useToast();
    const { addToCart } = useCart();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!product) return null;

    const allImages = [product.image_url, ...(product.extra_image_urls || [])].filter(Boolean);
    const hasMultipleImages = allImages.length > 1;

    const handleAddToCart = () => {
        // For shop products, we create a default variant on the fly
        const variant = { id: `${product.id}-default`, title: 'Standard', price_in_cents: product.price_in_cents };
        const cartProduct = { id: product.id, title: product.name, image: product.image_url, category: product.category };
        
        addToCart(cartProduct, variant, 1, 999);
        
        toast({
          title: "Added to Cart! 🛒",
          description: `${product.name} has been added to your cart.`,
        });
        setIsOpen(false);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setCurrentImageIndex(0); }}>
            <DialogContent className="sm:max-w-[625px] glass-effect text-white border-white/20">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-white">{product.name}</DialogTitle>
                    <DialogDescription className="text-gray-400 capitalize">
                        {product.category}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="relative">
                        <div className="w-full h-80 flex justify-center items-center bg-black/20 rounded-lg overflow-hidden">
                           <img src={allImages[currentImageIndex]} alt={`${product.name} - image ${currentImageIndex + 1}`} className="max-w-full max-h-full object-contain"/>
                        </div>
                        {hasMultipleImages && (
                            <>
                                <Button onClick={handlePrevImage} size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50">
                                    <ChevronLeft />
                                </Button>
                                <Button onClick={handleNextImage} size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50">
                                    <ChevronRight />
                                </Button>
                            </>
                        )}
                    </div>

                     {hasMultipleImages && (
                        <div className="flex gap-2 justify-center">
                            {allImages.map((imgUrl, index) => (
                                <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-[#0EB8E1]' : 'border-transparent hover:border-white/50'}`}>
                                    <img src={imgUrl} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <p className="text-gray-300">
                        {product.description || "No description available."}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-3xl font-bold text-[#0EB8E1]">${(product.price_in_cents / 100).toFixed(2)}</p>
                        <Button onClick={handleAddToCart} className="bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailModal;
