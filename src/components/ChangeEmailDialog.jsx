
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const emailSchema = z.object({
  newEmail: z.string().email({ message: "Invalid email address." }),
});

const ChangeEmailDialog = ({ isOpen, setIsOpen }) => {
  const { updateUserEmail } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data) => {
    await updateUserEmail(data.newEmail);
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="text-white">
        <DialogHeader>
          <DialogTitle>Change your email</DialogTitle>
          <DialogDescription>
            Enter your new email address below. We'll send a confirmation link to both your old and new addresses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4">
            <label htmlFor="newEmail" className="sr-only">New Email</label>
            <input
              id="newEmail"
              type="email"
              {...register("newEmail")}
              className={`appearance-none relative block w-full px-4 py-3 bg-white/5 border ${errors.newEmail ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EB8E1] focus:border-[#0EB8E1] focus:z-10 sm:text-sm`}
              placeholder="new.email@example.com"
            />
            {errors.newEmail && <p className="mt-2 text-xs text-red-400">{errors.newEmail.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailDialog;
