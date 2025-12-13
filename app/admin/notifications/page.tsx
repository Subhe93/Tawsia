import { AdminHeader } from '@/components/admin/admin-header';
import { NotificationsManagement } from '@/components/admin/notifications-management';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="إدارة الإشعارات"
        description="عرض وحذف إشعارات النظام."
      />
      <NotificationsManagement />
    </div>
  );
}