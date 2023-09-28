import { FC, useState } from "react";
import { DEFAULT_HOST, DEFAULT_PORT } from "../constants";
import { useSocket } from "src/hooks/useWebsocket";

export const Connection: FC = () => {
  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(`${DEFAULT_PORT}`);

  const { connect } = useSocket();

  const handleConnect = () => {
    if (port === "" || !host) return;
    connect(host, parseInt(port));
  };

  return (
    <div className='page pageConnection'>
      <h1>Выберите подключение</h1>
      <div>
        <button onClick={handleConnect}>Подключиться</button> к серверу
        <input
          type='text'
          placeholder='HOST'
          value={host}
          onChange={(event) => setHost(event.target.value)}
        />
        :
        <input
          type='text'
          placeholder='PORT'
          value={port}
          onChange={(event) => setPort(event.target.value)}
        />
      </div>
    </div>
  );
};
