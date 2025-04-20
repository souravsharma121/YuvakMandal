// src/components/layout/Alert.jsx
import React, { useContext } from 'react';
import AlertContext from '../../context/AlertContext';

const Alert = () => {
  const { alerts } = useContext(AlertContext);
  console.log(alerts);
  
  return (
    <div className="fixed top-20 right-4 z-50">
      {alerts.length > 0 &&
        alerts.map(alert => (
          <div
            key={alert.id}
            className={`mb-4 px-4 py-3 rounded relative ${
              alert.type === 'danger'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : alert.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-blue-100 border border-blue-400 text-blue-700'
            }`}
            role="alert"
          >
            {alert.message}
          </div>
        ))}
    </div>
  );
};

export default Alert;