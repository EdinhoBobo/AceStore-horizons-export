
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2, X, UploadCloud, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';

const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    price_in_cents: z.preprocess(
      (val) => Number(String(val).replace(/[^0-9.-]/g, '')) * 100,
      z.number().positive('Price must be a positive number')
    ),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    image_url: z.string().optional(),
    extra_image_urls: z.array(z.string()).optional(),
});

const AdminProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [extraImageFiles, setExtraImageFiles] = useState([]);
    const [extraImagePreviews, setExtraImagePreviews] = useState([]);

    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('all');
    const { toast } = useToast();
    
    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: { extra_image_urls: [] },
    });
    
    const watchedCategory = watch('category');
    const extraImageUrls = watch('extra_image_urls');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('order_index')
        ]);

        if (productsRes.error) {
            toast({ variant: 'destructive', title: 'Error fetching products', description: productsRes.error.message });
        } else {
            setProducts(productsRes.data);
        }

        if (categoriesRes.error) {
            toast({ variant: 'destructive', title: 'Error fetching categories', description: categoriesRes.error.message });
        } else {
            setCategories(categoriesRes.data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleImageUpload = async (file) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('product_images').upload(fileName, file);
        if (error) {
            toast({ variant: 'destructive', title: 'Image upload failed', description: error.message });
            return null;
        }
        const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(data.path);
        return publicUrl;
    };

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        let mainImageUrl = editingProduct?.image_url || '';
        if (mainImageFile) {
            mainImageUrl = await handleImageUpload(mainImageFile);
            if (!mainImageUrl) { setIsSubmitting(false); return; }
        }

        const uploadedExtraUrls = [];
        for (const file of extraImageFiles) {
            const url = await handleImageUpload(file);
            if (url) uploadedExtraUrls.push(url);
        }
        
        const finalExtraImageUrls = [...(formData.extra_image_urls || []), ...uploadedExtraUrls];
        const productData = { ...formData, image_url: mainImageUrl, extra_image_urls: finalExtraImageUrls };

        let error;
        if (editingProduct) {
            ({ error } = await supabase.from('products').update(productData).eq('id', editingProduct.id));
        } else {
            ({ error } = await supabase.from('products').insert([productData]));
        }

        if (error) {
            toast({ variant: 'destructive', title: 'Submission failed', description: error.message });
        } else {
            toast({ title: `Product ${editingProduct ? 'updated' : 'added'} successfully` });
            resetForm();
            fetchInitialData();
        }
        setIsSubmitting(false);
    };

    const resetForm = () => {
        reset({name: '', description: '', price_in_cents: undefined, category: '', subcategory: '', extra_image_urls: []});
        setEditingProduct(null);
        setMainImageFile(null);
        setMainImagePreview('');
        setExtraImageFiles([]);
        setExtraImagePreviews([]);
    }

    const handleEdit = (product) => {
        setEditingProduct(product);
        reset({
          ...product,
          price_in_cents: (product.price_in_cents / 100),
          extra_image_urls: product.extra_image_urls || [],
        });
        setMainImagePreview(product.image_url || '');
        setExtraImagePreviews(product.extra_image_urls || []);
        setMainImageFile(null);
        setExtraImageFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure?')) {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                toast({ variant: 'destructive', title: 'Deletion failed', description: error.message });
            } else {
                toast({ title: 'Product deleted' });
                fetchInitialData();
            }
        }
    };
    
    const removeExtraImage = (indexToRemove, isPreview) => {
        if (isPreview) {
            setExtraImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
            setExtraImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        } else {
            setValue('extra_image_urls', extraImageUrls.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleExtraImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length) {
            setExtraImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setExtraImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const inputClass = "appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm";
    
    const filteredProducts = products.filter(p => filterCategory === 'all' || p.category === filterCategory);
    const selectedCategoryObject = categories.find(c => c.name === watchedCategory);

    return (
        <div>
            <div className="glass-effect rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Name</label>
                            <input {...register('name')} className={inputClass} />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                           <label className="text-sm font-medium text-gray-300">Price (in USD)</label>
                           <input type="number" step="0.01" {...register('price_in_cents')} className={inputClass} placeholder="e.g., 50 for $50.00" />
                           {errors.price_in_cents && <p className="text-red-400 text-xs mt-1">{errors.price_in_cents.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <textarea {...register('description')} className={inputClass} rows="3"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Category</label>
                             <Controller name="category" control={control} render={({ field }) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10 capitalize">
                                            {field.value || 'Select a category'} <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full bg-gray-900 border-white/20 text-white">
                                        {categories.map(cat => <DropdownMenuItem key={cat.id} onSelect={() => { field.onChange(cat.name); setValue('subcategory', '') }} className="capitalize">{cat.name}</DropdownMenuItem>)}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             )} />
                            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-300 mb-1 block">Subcategory</label>
                             <Controller name="subcategory" control={control} render={({ field }) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={!watchedCategory || !selectedCategoryObject?.subcategories?.length}>
                                        <Button variant="outline" className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10 capitalize">
                                            {field.value || 'Select a subcategory'} <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full bg-gray-900 border-white/20 text-white">
                                        {(selectedCategoryObject?.subcategories || []).map(sub => <DropdownMenuItem key={sub} onSelect={() => field.onChange(sub)} className="capitalize">{sub}</DropdownMenuItem>)}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Main Image</label>
                                <label htmlFor="main-image-upload" className="cursor-pointer aspect-video w-full bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-white/10 hover:border-[#0EB8E1] transition-colors">
                                    {mainImagePreview ? (
                                        <img src={mainImagePreview} alt="Main preview" className="w-full h-full object-cover rounded-lg" />
                                    ) : ( <> <UploadCloud className="w-8 h-8 mb-2" /> <span>Click to upload</span> </> )}
                                </label>
                                <input id="main-image-upload" type="file" onChange={handleMainImageChange} accept="image/*" className="hidden"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Extra Images</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(extraImageUrls || []).map((url, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square">
                                        <img src={url} alt="Extra" className="w-full h-full rounded-md object-cover" />
                                        <button type="button" onClick={() => removeExtraImage(index, false)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"><X size={12} /></button>
                                    </div>
                                ))}
                                {extraImagePreviews.map((previewUrl, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square">
                                        <img src={previewUrl} alt="New extra" className="w-full h-full rounded-md object-cover" />
                                        <button type="button" onClick={() => removeExtraImage(index, true)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"><X size={12} /></button>
                                    </div>
                                ))}
                                <label htmlFor="extra-images-upload" className="cursor-pointer aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-white/10 hover:border-[#0EB8E1] transition-colors">
                                    <PlusCircle className="w-8 h-8" />
                                </label>
                                <input id="extra-images-upload" type="file" multiple onChange={handleExtraImagesChange} accept="image/*" className="hidden"/>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isSubmitting} className="bg-[#0EB8E1] hover:bg-[#0ca6c9]">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingProduct ? 'Update Product' : <><PlusCircle className="mr-2 h-4 w-4" /> Add Product</>)}
                        </Button>
                        {editingProduct && <Button variant="ghost" onClick={resetForm}>Cancel Edit</Button>}
                    </div>
                </form>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Existing Products</h2>
            <div className="mb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 capitalize">
                            {filterCategory === 'all' ? 'All Categories' : filterCategory}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-white/20 text-white">
                        <DropdownMenuItem onSelect={() => setFilterCategory('all')}>All Categories</DropdownMenuItem>
                        {categories.map(cat => (
                            <DropdownMenuItem key={cat.id} onSelect={() => setFilterCategory(cat.name)} className="capitalize">
                                {cat.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {loading ? <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div> :
             filteredProducts.length === 0 ? <p className="text-gray-400">No products found in this category.</p> :
            <div className="space-y-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="glass-effect p-4 rounded-lg flex items-center justify-between">
                       <div className="flex items-center gap-4">
                            <img src={p.image_url || 'https://placehold.co/64'} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-gray-700"/>
                            <div>
                                <p className="font-bold text-white">{p.name}</p>
                                <p className="text-sm text-[#0EB8E1]">${(p.price_in_cents / 100).toFixed(2)}</p>
                                <p className="text-xs text-gray-400 capitalize">{p.category} {p.subcategory && `> ${p.subcategory}`}</p>
                            </div>
                       </div>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>}
        </div>
    );
};

export default AdminProductManagement;