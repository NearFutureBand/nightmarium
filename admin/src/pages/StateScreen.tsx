import { useMemo } from "react";
import { ABILITIES, BODYPARTS } from "src/modules/GameCard/constants";
import { useStore } from "src/modules/Store";
import { Card, Game } from "src/types";

export function StateScreen() {
  const { store } = useStore();
  console.log(store);

  const games = useMemo(() => {
    return Object.values(store.games);
  }, [store.games]);

  return (
    <div className='h-full'>
      {games.map((game) => (
        <GameState game={game} key={game.id} />
      ))}
    </div>
  );
}

function GameState({ game }: { game: Game }) {
  const cardsAvailable = useMemo(
    () => Object.values(game.cardsAvailable),
    [game.cardsAvailable]
  );

  const cardsThrownAway = useMemo(
    () => Object.values(game.cardsThrownAway),
    [game.cardsThrownAway]
  );

  return (
    <div className='p-2 bg-slate-400'>
      <h1>Game {game.id}</h1>
      <CardList cards={cardsAvailable} title='Cards available' />
      <CardList cards={cardsThrownAway} title='Cards thrown' />
    </div>
  );
}

function CardList({ cards, title }: { cards: Card[]; title: string }) {
  return (
    <>
      <span>{title}</span>
      <div className='flex gap-2 overflow-x-scroll py-4'>
        {cards.map((card) => (
          <CardView card={card} key={card.id} />
        ))}
      </div>
    </>
  );
}

// TODO цвета
function CardView({ card }: { card: Card }) {
  return (
    <div className='w-40 h-20 border p-2 shrink-0'>
      <div className='flex justify-between'>
        <strong className='text-lg'>{card.id}</strong>
        <div>{card.ability !== null ? ABILITIES[card.ability] : ""} </div>
      </div>
      <span className='text-sm'>
        {card.bodypart
          .map((bodypartIndex) => BODYPARTS[bodypartIndex])
          .join(" | ")}
      </span>
    </div>
  );
}
