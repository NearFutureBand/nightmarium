import { useContext } from 'react';
import { SocketContext } from './context';

export const useWebsocket = () => useContext(SocketContext);
