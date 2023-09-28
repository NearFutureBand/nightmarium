import { FC } from "react";
import { useAppSelector } from "src/hooks/useAppSelector";
import { CardView } from "./CardView";

export const MyCards: FC = () => {
  const me = useAppSelector((state) => state.app.game!.me);
  const myCards = me.cards;

  return (
    <div className='my-cards'>
      {myCards.map((card) => (
        <CardView card={card} key={card.id} cardOnHand player={me} />
      ))}
    </div>
  );
};
