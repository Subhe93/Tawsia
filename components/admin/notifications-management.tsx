
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { AdminPagination } from '@/components/admin/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientSideDate } from '@/components/client-side-date';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/notifications?page=${page}&limit=${pagination.limit}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotifications(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الإشعارات.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('/api/admin/notifications', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: 'نجاح', description: 'تم حذف جميع الإشعارات بنجاح.' });
      fetchNotifications(1);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الإشعارات.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>قائمة الإشعارات</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">حذف الكل</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف جميع الإشعارات بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAll}>متابعة</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الرسالة</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">جاري التحميل...</TableCell></TableRow>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell><Badge variant="outline">{notification.type}</Badge></TableCell>
                  <TableCell><Badge variant={notification.isRead ? 'secondary' : 'default'}>{notification.isRead ? 'مقروءة' : 'جديدة'}</Badge></TableCell>
                  <TableCell><ClientSideDate date={notification.createdAt} /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center">لا توجد إشعارات لعرضها.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-6">
          <AdminPagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={fetchNotifications}
          />
        </div>
      </CardContent>
    </Card>
  );
}
