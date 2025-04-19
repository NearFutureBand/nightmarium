import { FormEventHandler, useEffect, useRef } from "react";
import { useWebsocket } from "src/modules/websocket";
import { restoreHostAndPort } from "src/utils/saveHostAndPort";

const { host, port } = restoreHostAndPort();

export const ConnectionPage = () => {
  const hostRef = useRef<HTMLInputElement>(null);
  const portRef = useRef<HTMLInputElement>(null);
  const connect = useWebsocket(state => state.connect);
  
  const handleConnect: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (hostRef.current && portRef.current) {
      connect(hostRef.current?.value, portRef.current?.value);
    }
  }

  useEffect(() => {
    if (hostRef.current?.value && portRef.current?.value) {
      connect(hostRef.current?.value, portRef.current?.value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
     <main className="min-h-dvh flex flex-col justify-center items-center gap-6">
      <h1>Выберите подключение</h1>
      <form onSubmit={handleConnect} className="flex gap-2 items-center">
        <button type="submit">Подключиться</button> к серверу
        <input
          ref={hostRef}
          type="text"
          placeholder="HOST"
          required
          defaultValue={host}
        />
        :
        <input
          ref={portRef}
          type="text"
          placeholder="PORT"
          required
          defaultValue={port}
        />
      </form>
    </main>
  )
}