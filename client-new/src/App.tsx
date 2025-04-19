import {  useWebsocket } from 'src/modules/websocket';
import { ConnectionPage } from 'src/pages/ConnectionPage';
import { StartPage } from './pages/StartPage';
import { useEffect } from 'react';

function App() {
  const isConnected = useWebsocket(state => state.connected);
  const disconnect = useWebsocket(state => state.disconnect);

  useEffect(() => {
    return () => {
      disconnect();
    }
  }, []);
 
  if (!isConnected) {
    return <ConnectionPage />
  }

  return (
    <StartPage />
  )
}

export default App
