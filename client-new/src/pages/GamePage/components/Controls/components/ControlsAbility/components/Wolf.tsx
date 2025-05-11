import { useWebsocket } from 'src/modules/websocket';
import { Card } from 'src/pages/GamePage/components/Card';

export const Wolf = () => {
  const ability = useWebsocket((s) => s.ability)!;

  const handleThrowOff = () => {};

  return (
    <>
      <div className="flex gap-x-2 justify-center w-auto [&>img]:h-32">
        {ability.cards!.map((card) => (
          <Card card={card} id={card.id} key={card.id} />
        ))}
      </div>
      <div>
        {/* <span>
          Карта {selectedCards[0]?.cardId || '-'} в монстра{' '}
          {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
        </span> */}
        {/* <button onClick={handleSubmit}>
          Выложить
        </button> */}
        <button onClick={handleThrowOff}>
          {/* Сбросить карт{selectedCards.length === 1 ? 'у' : 'ы'} */}
          Сбросить карты
        </button>
      </div>
    </>
  );
};
