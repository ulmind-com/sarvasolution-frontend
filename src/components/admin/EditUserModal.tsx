import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const editUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  panCardNumber: z.string().optional().refine(
    (val) => !val || val.length === 0 || val.length === 10,
    { message: 'PAN must be 10 characters' }
  ),
  rank: z.string(),
  status: z.enum(['active', 'inactive', 'blocked']),
  joiningPackage: z.number().min(0, 'Package must be positive'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  panCardNumber?: string;
  rank: string;
  status: 'active' | 'inactive' | 'blocked';
  joiningPackage: number;
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  userData: UserData;
  onSuccess: () => void;
}

const RANK_OPTIONS = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Blue Diamond',
  'Black Diamond',
  'Royal Diamond',
  'Crown Diamond',
  'Ambassador',
  'Crown Ambassador',
  'SSVPL Legend',
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
];

const EditUserModal = ({
  open,
  onOpenChange,
  memberId,
  userData,
  onSuccess,
}: EditUserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      panCardNumber: userData.panCardNumber || '',
      rank: userData.rank || 'Associate',
      status: userData.status || 'active',
      joiningPackage: userData.joiningPackage || 0,
    },
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        panCardNumber: userData.panCardNumber || '',
        rank: userData.rank || 'Associate',
        status: userData.status || 'active',
        joiningPackage: userData.joiningPackage || 0,
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/api/v1/admin/users/${memberId}`, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        panCardNumber: data.panCardNumber?.toUpperCase() || '',
        rank: data.rank,
        status: data.status,
        joiningPackage: data.joiningPackage,
      });
      
      toast.success('User details updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRank = watch('rank');
  const selectedStatus = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter full name"
              {...register('fullName')}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register('phone')}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* PAN Card */}
          <div className="space-y-2">
            <Label htmlFor="panCardNumber">PAN Card Number</Label>
            <Input
              id="panCardNumber"
              placeholder="ABCDE1234F"
              {...register('panCardNumber')}
              disabled={isSubmitting}
              className="uppercase"
              maxLength={10}
            />
            {errors.panCardNumber && (
              <p className="text-sm text-destructive">{errors.panCardNumber.message}</p>
            )}
          </div>

          {/* Rank Select */}
          <div className="space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Select
              value={selectedRank}
              onValueChange={(value) => setValue('rank', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                {RANK_OPTIONS.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rank && (
              <p className="text-sm text-destructive">{errors.rank.message}</p>
            )}
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'blocked')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {/* Joining Package */}
          <div className="space-y-2">
            <Label htmlFor="joiningPackage">Joining Package (₹)</Label>
            <Input
              id="joiningPackage"
              type="number"
              placeholder="500"
              {...register('joiningPackage', { valueAsNumber: true })}
              disabled={isSubmitting}
              min={0}
            />
            {errors.joiningPackage && (
              <p className="text-sm text-destructive">{errors.joiningPackage.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
