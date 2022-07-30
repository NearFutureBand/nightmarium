import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Card, PlayerBoard, MyCards, Controls } from './components';
import { ABILITIES, ABILITIES_DESCRIPTION } from './constants';
import {
  getSelectedMonsterId,
  getSelectedCardId,
  selectMonster,
  selectCard,
} from './slices';

let socket;

const App = () => {
  const dispatch = useDispatch();

  const selectedMonsterId = useSelector(getSelectedMonsterId);
  const selectedCardId = useSelector(getSelectedCardId);

  const [playerId, setPlayerId] = useState(null);
  const [game, setGame] = useState({});
  const [awaitingAbility, setAwaitingAbility] = useState({});

  const me = game?.me;
  const isMyTurn = game?.activePlayer?.id === playerId;

  useEffect(() => {
    socket = new WebSocket('ws://localhost:9000');

    socket.onopen = () => {
      const playerId = localStorage.getItem('playerId');
      console.log('CLIENT: connected', playerId);
      socket.send(JSON.stringify({ type: 'HANDSHAKE', playerId }));
    };

    socket.onmessage = (event) => {
      const m = JSON.parse(event.data);
      console.log('CLIENT: message', m);

      if (m.type === 'HANDSHAKE') {
        localStorage.setItem('playerId', m.playerId);
        setPlayerId(m.playerId);
      }

      if (m.type === 'AWAIT_ABILITY') {
        let submitText = 'Подтвердить';
        switch (m.abilityType) {
          case 0: {
            submitText = 'Расстановка завершена';
            break;
          }
          case 1: {
            submitText = 'Забрать';
            break;
          }
          default: {
          }
        }
        setAwaitingAbility({ ...m, submitText });
      }

      if (m.type === 'MONSTER_COMPLETED') {
        setAwaitingAbility({});
      }

      setGame(m.game);
    };

    return () => {
      socket = undefined;
    };
  }, []);

  const onTakeCard = () => {
    socket.send(JSON.stringify({ type: 'TAKE_CARD' }));
  };

  const onPlaceCard = () => {
    if (!selectedCardId[0] || selectedMonsterId[0] === null) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: 'PLAY_CARD',
        cardId: selectedCardId[0],
        monsterId: selectedMonsterId[0],
      })
    );
    dispatch(selectCard({ cardId: null }));
    dispatch(selectMonster({ monsterId: null }));
  };

  const onStartGame = () => {
    socket.send(JSON.stringify({ type: 'START' }));
  };

  const onSpecialCardClick = (event, card) => {
    if (awaitingAbility.abilityType === 0) {
      //setSelectedCardId(selectedCardId === card.id ? null : card.id);
    }
  };

  const onSubmitAbility = () => {
    const payload = {
      abilityType: awaitingAbility.abilityType,
      abilityNumber: awaitingAbility.abilityNumber,
    };

    // 0 ????

    if (awaitingAbility.abilityType === 1) {
      payload.cards = awaitingAbility.cards;
    }

    if (awaitingAbility.abilityType === 2) {
      payload.cardId = selectedCardId[0];
      payload.monsterId = selectedMonsterId[0];
    }

    if (awaitingAbility.abilityType === 3) {
      payload.cardId = selectedCardId[0];
      payload.targetMonsterId = selectedCardId[1];
      payload.targetPlayerId = selectedCardId[2];
    }

    if (awaitingAbility.abilityType === 4) {
      payload.targetMonsterId = selectedMonsterId[0];
      payload.targetPlayerId = selectedMonsterId[1];
    }

    if (awaitingAbility.abilityType === 5) {
      payload.cardId = selectedCardId[0];
      payload.targetMonsterId = selectedCardId[2];
    }

    socket.send(
      JSON.stringify({
        type: 'SUBMIT_ABILITY',
        ...payload,
      })
    );

    if (
      awaitingAbility.abilityType === 2 ||
      awaitingAbility.abilityType === 3 ||
      awaitingAbility === 4
    ) {
      dispatch(selectCard({ cardId: null }));
      dispatch(selectMonster({ monsterId: null }));
    }
  };

  if (!game?.activePlayer) {
    return (
      <div className="App">
        Привет, {playerId}. <button onClick={onStartGame}>Начать игру</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <span>
          Я - <strong>{playerId}</strong>. Ходит{' '}
          <strong>{game?.activePlayer?.id}</strong>
        </span>
      </header>

      <Controls
        game={game}
        isMyTurn={isMyTurn}
        awaitingAbility={awaitingAbility}
        onTakeCard={onTakeCard}
        onPlaceCard={onPlaceCard}
        onSpecialCardClick={onSpecialCardClick}
        onSubmitAbility={onSubmitAbility}
      />

      <PlayerBoard
        player={me}
        isMyTurn={isMyTurn}
        awaitingAbility={awaitingAbility}
        itsMe
      />

      {/* <div className="players">
        {(game.players || []).map((player) => {
          if (player.id === me.id) {
            return null;
          }
          return (
            <PlayerBoard
              player={player}
              key={player.id}
              awaitingAbility={awaitingAbility}
              isMyTurn={isMyTurn}
            />
          );
        })}
      </div> */}

      <MyCards cards={me.cards || []} />

      <div className="placeholder" />
    </div>
  );
};

export default App;
