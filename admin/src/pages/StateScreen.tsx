import { useStore } from 'src/modules/Store';
import { Card, Game } from 'src/types';
import { CardView } from 'src/components/CardView';

export function StateScreen() {
  const { store } = useStore();
  console.log(store);

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
  const cardsAvailable = Object.values(game.cardsAvailable);
  const cardsThrownAway = Object.values(game.cardsThrownAway);

  return (
    <div className="p-2 bg-slate-300">
      <h1 className="text-2xl">Game {game.id}</h1>
      <CardList cards={cardsAvailable} title="Cards available" />
      <CardList cards={cardsThrownAway} title="Cards thrown" />
    </div>
  );
}

function CardList({ cards, title }: { cards: Card[]; title: string }) {
  return (
    <>
      <span className="font-semibold">{title}</span>
      <div className="flex flex-wrap gap-2 py-4">
        {cards.map((card) => (
          <CardView card={card} key={card.id} />
        ))}
      </div>
    </>
  );
}
