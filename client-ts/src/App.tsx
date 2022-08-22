import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GamePanel } from './components';
import { MESSAGE_TYPE } from './constants';
import { useSocket } from './hooks';
import { Game, MessageHandshake, MessageWithGame } from './types';

function App() {
  const [game, setGame] = useState<Game>();
  const [playerId, setPlayerId] = useState<string | null>(null);

  const onHandshake = useCallback((message: MessageHandshake) => {
    setPlayerId(message.playerId);
    setGame(message.game);
  }, []);

  const onGameStart = useCallback((message: MessageWithGame) => {
    setGame(message.game);
  }, []);

  const socket = useSocket({ onHandshake, onGameStart });

  const isGameStarted = useMemo(
    () => Boolean(game?.activePlayer),
    [game?.activePlayer]
  );

  const startGame = useCallback(() => {
    socket?.send(JSON.stringify({ type: MESSAGE_TYPE.START }));
  }, [socket]);

  if (!game || !isGameStarted) {
    return (
      <div className="App">
        Привет, {playerId}. <button onClick={startGame}>Начать игру</button>
      </div>
    );
  }

  return <GamePanel game={game} />;
}

export default App;
