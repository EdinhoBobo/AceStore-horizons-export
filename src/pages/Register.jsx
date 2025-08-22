import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const Register = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema)
    });

    const handleRegister = async (data) => {
        setLoading(true);
        const { error } = await signUp(data.email, data.password);
        setLoading(false);
        if (!error) {
            toast({
                title: "Registration Successful!",
                description: "Please check your email to confirm your account.",
            });
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-w-md w-full space-y-8 glass-effect p-10 rounded-2xl shadow-2xl"
            >
                <div>
                    <h2 className="text-center text-4xl font-extrabold text-white" style={{ textShadow: '0 0 10px rgba(14, 184, 225, 0.5)'}}>
                        Create Account
                    </h2>
                     <p className="mt-2 text-center text-sm text-gray-400">
                        Join Ace Store today!
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleRegister)}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Email address</label>
                            <input
                                type="email"
                                {...register("email")}
                                className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] sm:text-sm`}
                                placeholder="you@example.com"
                            />
                             {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <input
                                type="password"
                                {...register("password")}
                                className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] sm:text-sm`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] sm:text-sm`}
                                placeholder="••••••••"
                            />
                             {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/login" className="font-medium text-[#0EB8E1] hover:text-[#0ca6c9] transition-colors">
                                Already have an account? Sign In
                            </Link>
                        </div>
                    </div>

                    <div>
                         <Button type="submit" className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-[#0EB8E1] hover:bg-[#0ca6c9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ca6c9] focus:ring-offset-gray-900 transition-all duration-300" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;