import { useEffect, useState } from 'react';

export default function ConnectionBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (online) return null;
  return <div className="connection-banner" role="status" aria-live="polite">أنت الآن دون اتصال. يمكنك مراجعة البيانات المحملة، ولن يتم اعتماد الأسعار أو الطلبات الحساسة دون اتصال بالخادم.</div>;
}
