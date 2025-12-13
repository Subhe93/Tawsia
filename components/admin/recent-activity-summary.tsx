
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, MessageSquare, Users } from 'lucide-react';

interface Activity {
  type: 'company' | 'review' | 'user';
  title: string;
  description: string;
  date: string;
}

export function RecentActivitySummary() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/recent-activity');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>النشاط الأخير</CardTitle>
        <CardDescription>آخر الأنشطة على المنصة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p>جاري التحميل...</p>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'company' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'review' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'company' ? <Building2 className="h-4 w-4" /> :
                   activity.type === 'review' ? <MessageSquare className="h-4 w-4" /> :
                   <Users className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>لا توجد أنشطة لعرضها.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
