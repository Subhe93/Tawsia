'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DeleteAwardButtonProps {
  awardId: string;
  awardTitle: string;
  onDelete: () => void;
}

export function DeleteAwardButton({ awardId, awardTitle, onDelete }: DeleteAwardButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/awards?id=${awardId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'تم حذف الجائزة بنجاح',
          description: 'تم حذف الجائزة من النظام',
        });
        setOpen(false);
        onDelete();
      } else {
        toast({
          title: 'خطأ في حذف الجائزة',
          description: result.error?.message || 'حدث خطأ أثناء حذف الجائزة',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ في حذف الجائزة:', error);
      toast({
        title: 'خطأ في حذف الجائزة',
        description: 'حدث خطأ أثناء حذف الجائزة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 ml-2" />
            تأكيد حذف الجائزة
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            هل أنت متأكد من حذف الجائزة <strong>"{awardTitle}"</strong>؟
          </p>
          <p className="text-sm text-red-600">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الجائزة نهائياً من النظام.
          </p>
          
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الحذف...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف الجائزة
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
