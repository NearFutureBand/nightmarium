import { useWebsocket } from ".."

export const useSendMessage = () => {
  return useWebsocket(state => state.sendMessage);
}