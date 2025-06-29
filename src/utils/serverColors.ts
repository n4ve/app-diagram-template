/**
 * Server Color Configuration
 * Provides consistent color theming across all components
 */

export interface ServerColorScheme {
  bg: string;
  text: string;
  border: string;
  leftBorder: string;
}

export const serverColors: Record<string, ServerColorScheme> = {
  'auth-server': { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    border: 'border-blue-600', 
    leftBorder: 'border-l-blue-500' 
  },
  'payment-server': { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    border: 'border-green-600', 
    leftBorder: 'border-l-green-500' 
  },
  'user-server': { 
    bg: 'bg-purple-500', 
    text: 'text-white', 
    border: 'border-purple-600', 
    leftBorder: 'border-l-purple-500' 
  },
  'analytics-server': { 
    bg: 'bg-orange-500', 
    text: 'text-white', 
    border: 'border-orange-600', 
    leftBorder: 'border-l-orange-500' 
  },
  'notification-server': { 
    bg: 'bg-pink-500', 
    text: 'text-white', 
    border: 'border-pink-600', 
    leftBorder: 'border-l-pink-500' 
  },
  'product-server': { 
    bg: 'bg-indigo-500', 
    text: 'text-white', 
    border: 'border-indigo-600', 
    leftBorder: 'border-l-indigo-500' 
  },
  'order-server': { 
    bg: 'bg-red-500', 
    text: 'text-white', 
    border: 'border-red-600', 
    leftBorder: 'border-l-red-500' 
  }
};

export const serverNames: Record<string, string> = {
  'auth-server': 'Auth',
  'payment-server': 'Payment',
  'user-server': 'User',
  'analytics-server': 'Analytics', 
  'notification-server': 'Notify',
  'product-server': 'Product',
  'order-server': 'Order'
};

export const getServerColor = (serverId: string): ServerColorScheme => {
  return serverColors[serverId] || { 
    bg: 'bg-gray-500', 
    text: 'text-white', 
    border: 'border-gray-600', 
    leftBorder: 'border-l-gray-500' 
  };
};

export const getServerName = (serverId: string): string => {
  return serverNames[serverId] || serverId;
};