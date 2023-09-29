import { SocketConnectProvider } from "src/modules/WebSocket";
import { useWebsocket } from "./modules/WebSocket/hooks";
import { StateScreen } from "./pages/StateScreen";
import { StoreProvider } from "./modules/Store";

export function Router() {
  const { isConnected } = useWebsocket();

  return (
    <>
      <header className='sticky top-0 w-full shadow-sm'>
        Status: {isConnected ? "Connected" : "Disconnected"}
      </header>
      {!isConnected && <StateScreen />}
    </>
  );
}

export function App() {
  return (
    <SocketConnectProvider>
      <StoreProvider>
        <Router />
      </StoreProvider>
    </SocketConnectProvider>
  );
}
