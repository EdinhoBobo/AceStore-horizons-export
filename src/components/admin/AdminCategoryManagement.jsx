
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog.jsx";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
});

const subcategorySchema = z.object({
  name: z.string().min(2, 'Subcategory name must be at least 2 characters').max(50),
});

const SortableCategoryItem = ({ id, category, handleEdit, handleDelete, handleAddSubcategory, handleRemoveSubcategory }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-effect p-4 rounded-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-white transition-colors"><GripVertical /></button>
          <p className="font-bold text-white capitalize">{category.name}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => handleEdit(category)}><Edit className="w-4 h-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the category "{category.name}". All products in this category will have their category unassigned. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(category)} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Subcategories</h4>
        <div className="flex flex-wrap gap-2 items-center">
            {category.subcategories?.map(sub => (
                <div key={sub} className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span>{sub}</span>
                    <button onClick={() => handleRemoveSubcategory(category, sub)} className="text-gray-400 hover:text-white transition-colors"><X size={12} /></button>
                </div>
            ))}
             <form onSubmit={e => {
                e.preventDefault();
                const subName = e.target.elements.subcategory.value;
                if(subName) handleAddSubcategory(category, subName);
                e.target.reset();
             }} className="flex gap-2">
                <input name="subcategory" placeholder="New subcategory..." className="bg-transparent border-b border-white/20 text-xs focus:outline-none focus:border-[#0EB8E1]" />
                <Button type="submit" size="icon" variant="ghost" className="h-6 w-6"><PlusCircle size={16} /></Button>
             </form>
        </div>
      </div>
    </div>
  );
};


const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ resolver: zodResolver(categorySchema) });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('order_index');
    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching categories', description: error.message });
    } else {
      setCategories(data.map(c => ({...c, subcategories: c.subcategories || []})));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    let error;
    if (editingCategory) {
      const { error: updateError } = await supabase.from('categories').update({ name: formData.name }).eq('id', editingCategory.id);
      error = updateError;
      if (!error) {
        await supabase.from('products').update({ category: formData.name }).eq('category', editingCategory.name);
      }
    } else {
        const { data: maxOrder } = await supabase.from('categories').select('order_index').order('order_index', { ascending: false }).limit(1).single();
        const newOrderIndex = (maxOrder?.order_index || 0) + 1;
        const { error: insertError } = await supabase.from('categories').insert([{ name: formData.name, order_index: newOrderIndex, subcategories: [] }]);
        error = insertError;
    }
    if (error) {
      toast({ variant: 'destructive', title: 'Submission failed', description: error.message });
    } else {
      toast({ title: `Category ${editingCategory ? 'updated' : 'added'} successfully` });
      reset({ name: '' });
      setEditingCategory(null);
      fetchCategories();
    }
    setIsSubmitting(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (categoryToDelete) => {
    await supabase.from('products').update({ category: null, subcategory: null }).eq('category', categoryToDelete.name);
    const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Deletion failed', description: error.message });
    } else {
      toast({ title: 'Category deleted successfully' });
      fetchCategories();
    }
  };

  const handleAddSubcategory = async (category, subcategoryName) => {
      const newSubcategories = [...(category.subcategories || []), subcategoryName];
      const { error } = await supabase.from('categories').update({ subcategories: newSubcategories }).eq('id', category.id);
      if (error) {
          toast({ variant: 'destructive', title: 'Failed to add subcategory', description: error.message });
      } else {
          toast({ title: 'Subcategory added!' });
          fetchCategories();
      }
  };

  const handleRemoveSubcategory = async (category, subcategoryName) => {
      const newSubcategories = (category.subcategories || []).filter(s => s !== subcategoryName);
      const { error } = await supabase.from('categories').update({ subcategories: newSubcategories }).eq('id', category.id);
      if (error) {
          toast({ variant: 'destructive', title: 'Failed to remove subcategory', description: error.message });
      } else {
          await supabase.from('products').update({ subcategory: null }).eq('category', category.name).eq('subcategory', subcategoryName);
          toast({ title: 'Subcategory removed!' });
          fetchCategories();
      }
  };
  
  const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          const oldIndex = categories.findIndex(c => c.id === active.id);
          const newIndex = categories.findIndex(c => c.id === over.id);
          const newCategories = arrayMove(categories, oldIndex, newIndex);
          setCategories(newCategories);

          const updates = newCategories.map((c, index) => 
            supabase.from('categories').update({ order_index: index + 1 }).eq('id', c.id)
          );
          const results = await Promise.all(updates);
          const hasError = results.some(res => res.error);
          if (hasError) {
              toast({ variant: 'destructive', title: 'Failed to save new order' });
              fetchCategories(); // revert optimistic update
          } else {
              toast({ title: 'Category order saved!' });
          }
      }
  };

  const inputClass = "appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm";

  return (
    <div>
      <div className="glass-effect rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="text-sm font-medium text-gray-300">Category Name</label>
            <input {...register('name')} className={inputClass} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="bg-[#0EB8E1] hover:bg-[#0ca6c9]">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCategory ? 'Update' : <PlusCircle className="h-5 w-5" />)}
            </Button>
            {editingCategory && <Button variant="ghost" onClick={() => { setEditingCategory(null); reset(); }}>Cancel</Button>}
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Existing Categories</h2>
        <p className="text-gray-400 text-sm mb-4">Drag and drop to reorder categories.</p>
      {loading ? <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div> :
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                {categories.map(cat => (
                    <SortableCategoryItem 
                        key={cat.id} 
                        id={cat.id} 
                        category={cat}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleAddSubcategory={handleAddSubcategory}
                        handleRemoveSubcategory={handleRemoveSubcategory}
                    />
                ))}
                </div>
            </SortableContext>
        </DndContext>
      }
    </div>
  );
};

export default AdminCategoryManagement;