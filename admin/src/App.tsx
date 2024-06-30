import { SocketConnectProvider, useWebsocket } from 'src/modules/WebSocket';
import { StateScreen } from './pages/StateScreen';
import { StoreProvider } from './modules/Store/context';

export function Router() {
  const { isConnected } = useWebsocket();

  return (
    <>
      <header className="sticky top-0 w-full shadow-sm bg-white px-4 py-2">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </header>
      {isConnected && <StateScreen />}
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <SocketConnectProvider>
        <Router />
      </SocketConnectProvider>
    </StoreProvider>
  );
}
