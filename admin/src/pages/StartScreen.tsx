import { useWebsocket } from "src/modules/WebSocket/hooks";
import { MESSAGE_TYPE } from "src/types";

export function StartScreen() {
  const { sendMessage } = useWebsocket();

  const setAsAdmin = () =>
    sendMessage<{ name: string }>({
      type: MESSAGE_TYPE.SET_NAME,
      name: "admin",
    });

  return (
    <div className='h-full flex justify-center items-center'>
      <button onClick={setAsAdmin}>Name myself as admin</button>
    </div>
  );
}
