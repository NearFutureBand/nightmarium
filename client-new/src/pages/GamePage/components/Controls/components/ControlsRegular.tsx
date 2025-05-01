import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import { LastStep } from './LastStep';

export const ControlsRegular = () => {
  const { actions } = useGameData();

  const handleTakeCard = () => {};
  const handlePlaceCard = () => {};
  const handleChangeCards = () => {};

  return (
    <>
      <section className="flex flex-col md:flex-row gap-2">
        <button onClick={handleTakeCard}>Взять карту</button>
        <button onClick={handlePlaceCard}>Выложить карту</button>
        <button onClick={handleChangeCards}>Обменять карты</button>
      </section>

      <section>
        <div>
          Действий осталось: <strong>{actions}</strong>
        </div>
        <LastStep />
      </section>
    </>
  );
};
