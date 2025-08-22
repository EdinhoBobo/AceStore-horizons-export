import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SuggestionWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const { toast } = useToast();
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Required",
                description: "You must be logged in to send a suggestion.",
            });
            return;
        }
        if (!suggestion.trim()) return;

        const { error } = await supabase
            .from('suggestions')
            .insert([{ content: suggestion, user_id: user.id }]);

        if (error) {
            toast({
                variant: "destructive",
                title: "Oh no! Something went wrong.",
                description: "Could not save your suggestion. Please try again.",
            });
        } else {
            toast({
                title: "Suggestion Sent!",
                description: "Thanks for your feedback! We'll take a look at it.",
            });
            setSuggestion('');
            setIsOpen(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 left-6 z-50">
                <AnimatePresence>
                    {!isOpen && (
                         <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <Button
                                onClick={() => setIsOpen(true)}
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-14 w-14"
                            >
                                <MessageSquare className="h-7 w-7" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-6 z-50 w-80"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="glass-effect p-4 rounded-lg shadow-2xl flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white">Send a Suggestion</h3>
                                <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                                    <X size={18} />
                                </Button>
                            </div>
                            <textarea
                                placeholder="Tell us your ideas..."
                                className="w-full h-32 p-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#0EB8E1]"
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full bg-[#0EB8E1] hover:bg-[#0ca6c9] text-white font-semibold flex items-center gap-2">
                                <Send size={16} /> Send
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SuggestionWidget;