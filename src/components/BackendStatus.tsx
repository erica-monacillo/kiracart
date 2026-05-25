import { useState, useEffect } from 'react';
import { healthCheck } from '../utils/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking backend...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await healthCheck();
        if (health.status === 'ok') {
          setStatus('connected');
          setMessage('Backend connected');
        } else {
          setStatus('error');
          setMessage('Backend not responding');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to connect to backend');
      }
    };

    checkBackend();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-200">
        <Loader className="size-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-green-200">
        <CheckCircle className="size-4 text-green-500" />
        <span className="text-sm text-gray-700">{message}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-red-200">
      <XCircle className="size-4 text-red-500" />
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  );
}
