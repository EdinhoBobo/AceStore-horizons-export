import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
    const { user, signIn, resetPasswordForEmail } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(loginSchema)
    });

    useEffect(() => {
        if (user) {
            navigate('/account');
        }
    }, [user, navigate]);

    const handleLogin = async (data) => {
        setLoading(true);
        const { error } = await signIn(data.email, data.password);
        setLoading(false);
        if (!error) {
            toast({
                title: "Login Successful!",
                description: "Welcome back!",
            });
            navigate('/account');
        }
    };

    const handleForgotPassword = async () => {
        const email = getValues("email");
        if (!email || !z.string().email().safeParse(email).success) {
            toast({
                variant: "destructive",
                title: "Invalid Email",
                description: "Please enter a valid email address to reset your password.",
            });
            return;
        }

        setLoading(true);
        const { error } = await resetPasswordForEmail(email);
        setLoading(false);

        if (!error) {
            toast({
                title: "Password Reset Email Sent!",
                description: "Check your email for a password reset link.",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-w-md w-full space-y-8 glass-effect p-10 rounded-2xl shadow-2xl"
            >
                <div>
                    <h2 className="text-center text-4xl font-extrabold text-white" style={{ textShadow: '0 0 10px rgba(14, 184, 225, 0.5)'}}>
                        Sign In
                    </h2>
                     <p className="mt-2 text-center text-sm text-gray-400">
                        Access your Ace Store account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleLogin)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="text-sm font-medium text-gray-300">Email address</label>
                            <input
                                id="email-address"
                                type="email"
                                {...register("email")}
                                className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm`}
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                {...register("password")}
                                className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm`}
                                placeholder="••••••••"
                            />
                             {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/register" className="font-medium text-[#0EB8E1] hover:text-[#0ca6c9] transition-colors">
                                Don't have an account? Register
                            </Link>
                        </div>
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="font-medium text-gray-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-md text-white bg-[#0EB8E1] hover:bg-[#0ca6c9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ca6c9] focus:ring-offset-gray-900 transition-all duration-300" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;