import { SocketConnectProvider } from "./SocketConnectProvider";

export const App = () => {
  return (
    <SocketConnectProvider>
      <div>
        <p>Cards available:</p>
      </div>
    </SocketConnectProvider>
  );
};
