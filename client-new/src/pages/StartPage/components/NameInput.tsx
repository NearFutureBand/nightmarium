import { useRef } from 'react';
import { useWebsocket } from 'src/modules/websocket';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';

export function NameInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const playerId = useWebsocket((state) => state.me?.id);
  const sendMessage = useSendMessage();

  const handleSubmitName: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (playerId && inputRef.current?.value) {
      sendMessage({ type: 'SET_NAME', playerId: playerId, name: inputRef.current?.value || '' });
    }
  };

  return (
    <form className="flex gap-2 items-center" onSubmit={handleSubmitName}>
      Представьтесь, пожалуйста: <input type="text" ref={inputRef} maxLength={50} />
      <button type="submit">Сохранить имя</button>
    </form>
  );
}
