'use client';

import { useSearchParams } from 'next/navigation';
import { NotificationList, NotificationDetail } from '@/features/notification';

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const notificationId = searchParams.get('id');

  if (notificationId) {
    return <NotificationDetail notificationId={notificationId} />;
  }

  return <NotificationList />;
}
