import { Card } from './Card';
import { useIsTurn } from 'src/hooks/useIsTurn';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';

export const MyCards = () => {
  const {
    me: { cards: myCards },
    legionMode
  } = useGameData();
  const { isMyTurn } = useIsTurn();
  console.log({ isMyTurn });
  // const ability = useAbility();

  // const disableCards = !isMyTurn || Boolean(ability);
  const disableCards = (() => {
    if (legionMode) return isMyTurn;
    if (!legionMode) return !isMyTurn;
  })();

  return (
    <div className="fixed flex flex-row-reverse justify-end gap-2 bottom-0 h-32 p-2 pt-4 overflow-y-visible overflow-x-auto w-full bg-bg-500/90 [&>img]:ml-[-20px] [&>img]:relative">
      {myCards?.map((card) => (
        <Card id={card.id} card={card} key={card.id} disabled={disableCards} hoverEffect />
      ))}
    </div>
  );
};
