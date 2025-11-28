import React, { useState, useEffect } from 'react';
import { generateAlerts } from '../services/geminiService';
import type { Alert } from '../types';
import Spinner from './common/Spinner';

const AlertIcon: React.FC<{ severity: Alert['severity'] }> = ({ severity }) => {
  const baseClasses = "h-6 w-6";
  switch (severity) {
    case 'high':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-luxen-red`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    case 'medium':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-luxen-yellow`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'low':
      return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await generateAlerts();
        setAlerts(data);
      } catch (err) {
        setError('Error al cargar las alertas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getSeverityClasses = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-500';
      case 'medium': return 'bg-yellow-50 border-yellow-500';
      case 'low': return 'bg-blue-50 border-blue-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-tec-gray mb-4">Alertas de Inventario</h2>
      {loading && <div className="flex justify-center items-center h-64"><Spinner /></div>}
      {error && <div className="text-center text-luxen-red p-4 bg-red-100 rounded-md">{error}</div>}
      {!loading && !error && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex items-start p-4 rounded-md border-l-4 ${getSeverityClasses(alert.severity)}`}>
              <div className="flex-shrink-0">
                 <AlertIcon severity={alert.severity} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <span>SKU: {alert.materialSku}</span> | <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;