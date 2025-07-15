import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';

interface ConnectionState {
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isLoading: boolean;
}

interface ConnectionStatusProps {
  connections: Record<string, ConnectionState>;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connections,
  showDetails = false,
  size = 'md'
}) => {
  const allConnected = Object.values(connections).every(conn => conn.isConnected);
  const hasErrors = Object.values(connections).some(conn => conn.error);
  const isLoading = Object.values(connections).some(conn => conn.isLoading);
  
  const lastUpdate = Math.max(
    ...Object.values(connections)
      .map(conn => conn.lastUpdate?.getTime() || 0)
      .filter(time => time > 0)
  );

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  if (isLoading && !lastUpdate) {
    return (
      <div className="flex items-center space-x-2">
        <Clock className={`${iconSize} text-blue-500 animate-pulse`} />
        <span className={`${textSize} text-gray-600`}>Connecting...</span>
      </div>
    );
  }

  if (hasErrors && !allConnected) {
    return (
      <div className="flex items-center space-x-2">
        <AlertTriangle className={`${iconSize} text-yellow-500`} />
        <span className={`${textSize} text-gray-600`}>
          {showDetails ? 'Connection Issues' : 'Partial'}
        </span>
        {showDetails && (
          <div className="ml-2">
            <div className="text-xs text-yellow-600">
              {Object.entries(connections)
                .filter(([_, conn]) => conn.error)
                .map(([name, conn]) => (
                  <div key={name}>• {name}: {conn.error}</div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!allConnected) {
    return (
      <div className="flex items-center space-x-2">
        <WifiOff className={`${iconSize} text-red-500`} />
        <span className={`${textSize} text-gray-600`}>Disconnected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Wifi className={`${iconSize} text-green-500`} />
      <span className={`${textSize} text-gray-600`}>Connected</span>
      {showDetails && lastUpdate > 0 && (
        <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-400`}>
          • {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

// Live indicator component
export const LiveIndicator: React.FC<{ 
  isActive: boolean; 
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}> = ({ 
  isActive, 
  size = 'md',
  showText = true 
}) => {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  return (
    <div className="flex items-center space-x-1">
      <div className={`${dotSize} rounded-full ${
        isActive 
          ? 'bg-green-400 animate-pulse' 
          : 'bg-gray-400'
      }`}></div>
      {showText && (
        <span className={`${textSize} text-gray-500`}>
          {isActive ? 'Live' : 'Paused'}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus; 