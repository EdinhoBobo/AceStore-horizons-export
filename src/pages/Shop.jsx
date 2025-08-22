
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown } from 'lucide-react';
import ProductsList from '@/components/ProductsList.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Shop = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [categories, setCategories] = useState([]);
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('name, subcategories')
                .neq('name', 'bots')
                .order('order_index');
            
            if (!error) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory('all');
        setFilters(prev => ({...prev, category: category === 'all' ? undefined : category, subcategory: undefined, search: searchTerm}));
    };

    const handleSubcategoryChange = (subcategory) => {
        setSelectedSubcategory(subcategory);
        setFilters(prev => ({...prev, subcategory: subcategory === 'all' ? undefined : subcategory, search: searchTerm}));
    };
    
    const handleSearchChange = (event) => {
      const term = event.target.value;
      setSearchTerm(term);
      setFilters(prev => ({ ...prev, search: term }));
    };

    const selectedCategoryObject = categories.find(c => c.name === selectedCategory);

    return (
        <div className="container mx-auto px-4">
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-7xl font-bold text-white text-center mb-12"
                style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
            >
                Catalog
            </motion.h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <motion.aside 
                    initial={{ opacity: 0, x: -50 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }} 
                    className="lg:w-1/4"
                >
                    <div className="glass-effect rounded-xl p-6 sticky top-28">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Filter className="w-6 h-6" />Filters</h2>
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="text" placeholder="Search items..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EB8E1]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Categories</h3>
                            <button onClick={() => handleCategoryChange('all')} className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 capitalize ${selectedCategory === 'all' ? 'bg-[#0EB8E1] text-white' : 'text-gray-300 hover:bg-white/10'}`}>All Items</button>
                            {categories.map((category) => (
                                <div key={category.name}>
                                    <div className="flex items-center">
                                      <button onClick={() => handleCategoryChange(category.name)} className={`flex-grow text-left px-4 py-2 rounded-lg transition-all duration-200 capitalize ${selectedCategory === category.name ? 'bg-[#0EB8E1] text-white' : 'text-gray-300 hover:bg-white/10'}`}>{category.name}</button>
                                       {category.subcategories && category.subcategories.length > 0 && selectedCategory === category.name && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 ml-2"><ChevronDown className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-gray-800 border-white/20 text-white">
                                                    <DropdownMenuItem onSelect={() => handleSubcategoryChange('all')}>All {category.name}</DropdownMenuItem>
                                                    {category.subcategories.map(sub => (
                                                        <DropdownMenuItem key={sub} onSelect={() => handleSubcategoryChange(sub)} className="capitalize">{sub}</DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                     {selectedCategory === category.name && selectedCategoryObject?.subcategories?.length > 0 && (
                                        <div className="pl-6 pt-2 space-y-1">
                                            {selectedCategoryObject.subcategories.map(sub => (
                                                <button key={sub} onClick={() => handleSubcategoryChange(sub)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-200 capitalize ${selectedSubcategory === sub ? 'bg-[#0EB8E1]/50 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>{sub}</button>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.aside>

                <main className="lg:w-3/4">
                    <ProductsList filters={filters} />
                </main>
            </div>
        </div>
    );
};

export default Shop;