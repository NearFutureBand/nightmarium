import { useStore } from 'src/modules/Store';
import { Card, Game, MESSAGE_TYPE } from 'src/types';
import { CardView } from 'src/components/CardView';
import { useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { useWebsocket } from 'src/modules/WebSocket';

export function StateScreen() {
  const { store } = useStore();

  const games = Object.values(store.games);

  return (
    <div>
      {games.map((game) => (
        <GameState game={game} key={game.id} />
      ))}
    </div>
  );
}

function GameState({ game }: { game: Game }) {
  const { sendMessage } = useWebsocket();
  const updateCardsOrder = (cardId: number, targetIndex: number) => {
    sendMessage({ type: MESSAGE_TYPE.ADMIN_RESORT_CARDS, gameId: game.id, cardId, targetIndex });
  };
  return (
    <div className="p-2 bg-slate-300">
      <h1 className="text-2xl">Game {game.id}</h1>
      <CardGrid cards={game.cardsAvailable} title="Cards available" updateCardsOrder={updateCardsOrder} />
      <CardGrid cards={game.cardsThrownAway} title="Cards thrown" updateCardsOrder={updateCardsOrder} />
    </div>
  );
}

function CardGrid({
  cards,
  title,
  updateCardsOrder,
}: {
  cards: Card[];
  title: string;
  updateCardsOrder: (cardId: number, targetIndex: number) => void;
}) {
  const [draggedCard, setDraggedCard] = useState<{ cardId: number | null; cardIndex: number | null }>({
    cardId: null,
    cardIndex: null,
  });
  const [draggedOver, setDraggedOver] = useState<{ cardId: number | null; cardIndex: number | null }>({
    cardId: null,
    cardIndex: null,
  });

  const handleDrop = () => {
    const draggedCardIndex = draggedCard.cardId;
    const indexTo = draggedOver.cardIndex;
    if (draggedCardIndex === null || indexTo === null) return;
    updateCardsOrder(draggedCardIndex, indexTo);
    setDraggedCard({ cardId: null, cardIndex: null });
    setDraggedOver({ cardId: null, cardIndex: null });
  };

  return (
    <>
      <span className="font-semibold">{title}</span>
      <div className="w-full grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <CardView
            index={index}
            key={card.id}
            card={card}
            onDragStart={() => setDraggedCard({ cardId: card.id, cardIndex: index })}
            onDragEnd={() => setDraggedCard({ cardId: null, cardIndex: null })}
            onDragEnter={() => setDraggedOver({ cardId: card.id, cardIndex: index })}
            onDragLeave={() => setDraggedOver({ cardId: null, cardIndex: null })}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={twJoin(
              draggedCard.cardId === card.id && 'opacity-10',
              draggedOver?.cardId === card.id && 'bg-[red]'
            )}
          />
        ))}
      </div>
    </>
  );
}
