import { useContext } from 'react';
import { WebSocketContext } from './context';

export const useWebsocket = () => useContext(WebSocketContext);

export * from './provider';
