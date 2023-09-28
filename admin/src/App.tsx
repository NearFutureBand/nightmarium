import { SocketConnectProvider } from "src/modules/WebSocket";
import { useWebsocket } from "./modules/WebSocket/hooks";
import { StartScreen } from "./pages/StartScreen";

export function Router() {
  const { isConnected } = useWebsocket();

  return (
    <>
      <header className='sticky top-0 w-full shadow-sm'>
        Status: {isConnected ? "Connected" : "Disconnected"}
      </header>
      {isConnected && <StartScreen />}
    </>
  );
}

export function App() {
  return (
    <SocketConnectProvider>
      <Router />
    </SocketConnectProvider>
  );
}
