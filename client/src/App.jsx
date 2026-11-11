import { useEffect, useState } from 'react';
import AppLogo from './components/AppLogo.jsx';

export default function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((body) => setStatus(body.data.status))
      .catch(() => setStatus('server not reachable'));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-4">
      <AppLogo />
      <div className="rounded-[20px] bg-surface p-4 shadow-sm">
        <p className="text-sm text-ink-muted">Server status</p>
        <p className="text-xl font-semibold text-primary-700">{status}</p>
      </div>
      <button className="h-14 rounded-2xl bg-accent-500 text-lg font-bond text-white">
        Coral call to action
      </button>
    </main>
  );
}
