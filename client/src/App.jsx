import { useEffect, useState } from "react";

export default function App() {

  const [status, setStatus] = useState('checking...');

  useEffect(() => {

    fetch('/api/health')
    .then((res) => res.json())
    .then((body) => setStatus(body.data.status))
    .catch(() => setStatus('server not reachable'));
  }, []);

  return (
    <div>
      <h1>Settle</h1>
      <p>Server status: {status}</p>
    </div>
  );
}