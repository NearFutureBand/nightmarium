import { useWebsocket } from 'src/modules/websocket';
import { ConnectionPage } from 'src/pages/ConnectionPage';
import { StartPage } from './pages/StartPage';
import { useEffect } from 'react';
import { GamePage } from './pages/GamePage';

function App() {
  const isConnected = useWebsocket((state) => state.connected);
  const disconnect = useWebsocket((state) => state.disconnect);
  const amIReadyToPlay = useWebsocket((state) => state.me?.readyToPlay);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  if (!isConnected) {
    return <ConnectionPage />;
  }

  if (!amIReadyToPlay) return <StartPage />;

  return <GamePage />;
}

export default App;
