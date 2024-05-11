import { createContext } from 'react';
import { SocketContextType } from './types';

export const WebSocketContext = createContext<SocketContextType>({} as SocketContextType);
