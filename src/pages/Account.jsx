
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, CreditCard, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ChangeEmailDialog from '@/components/ChangeEmailDialog';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';

const profileSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must be 20 characters or less." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
});

const Account = () => {
  const { user, profile, loading: authLoading, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (profile) {
      reset({ username: profile.username || '' });
    }
  }, [user, profile, authLoading, navigate, reset]);

  const handleUpdateProfile = async (data) => {
    const { error } = await updateProfile({ username: data.username });
    if (!error) {
       reset({ username: data.username });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handlePaymentFeatureClick = () => {
    toast({
      title: "🚧 Feature In Development",
      description: "Please enable the Online Store integration to manage payment methods.",
    });
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <form className="space-y-6" onSubmit={handleSubmit(handleUpdateProfile)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2"><User size={14}/> Username</label>
                <input
                  id="username"
                  type="text"
                  {...register("username")}
                  className={`mt-1 appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.username ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm`}
                  placeholder="Choose a cool username"
                />
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
              </div>
            </div>
            <div>
              <Button type="submit" className="w-full" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Profile'}
              </Button>
            </div>
          </form>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <Button onClick={() => setIsEmailDialogOpen(true)} variant="outline" className="w-full justify-start text-left bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">Change Email</Button>
            <Button onClick={() => setIsPasswordDialogOpen(true)} variant="outline" className="w-full justify-start text-left bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">Change Password</Button>
          </div>
        );
      case 'payment':
        return (
           <div className="text-center text-gray-400 py-8">
            <CreditCard className="mx-auto h-12 w-12 mb-4" />
            <p>Saved payment methods will appear here.</p>
             <Button onClick={handlePaymentFeatureClick} className="mt-4">Add Payment Method</Button>
          </div>
        );
      default:
        return null;
    }
  }

  const tabClass = (tabName) => `flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 ${activeTab === tabName ? 'bg-white/10 text-[#0EB8E1]' : 'hover:bg-white/10'}`;

  return (
    <>
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-1">
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-center mb-6">
                <User className="h-16 w-16 mx-auto rounded-full bg-white/10 p-3 text-[#0EB8E1]" />
                <h3 className="mt-4 text-xl font-bold text-white">{profile?.username || 'New User'}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <nav className="space-y-2 text-white">
                <div className={tabClass('profile')} onClick={() => setActiveTab('profile')}>
                  <User size={20} /><span>Profile</span>
                </div>
                <div className={tabClass('security')} onClick={() => setActiveTab('security')}>
                  <Shield size={20} /><span>Security</span>
                </div>
                <div className={tabClass('payment')} onClick={() => setActiveTab('payment')}>
                  <CreditCard size={20} /><span>Payment Methods</span>
                </div>
                <div className="border-t border-white/10 my-2 !mt-4"></div>
                <div className={`${tabClass('logout')} !text-red-400 hover:!bg-red-500/10`} onClick={handleSignOut}>
                  <LogOut size={20} /><span>Sign Out</span>
                </div>
              </nav>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="glass-effect p-8 rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      <ChangeEmailDialog isOpen={isEmailDialogOpen} setIsOpen={setIsEmailDialogOpen} />
      <ChangePasswordDialog isOpen={isPasswordDialogOpen} setIsOpen={setIsPasswordDialogOpen} />
    </>
  );
};

export default Account;
