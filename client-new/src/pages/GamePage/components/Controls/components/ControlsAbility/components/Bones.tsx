import { useSelection } from 'src/modules/selection/useSelection';

/** TODO продолжать тут - создал стейт для поддержки выбранного монстра и карты */
export const Bones = () => {
  const selectedMonster = useSelection((s) => s.selectedMonster);
  return (
    <>
      {selectedMonster && (
        <span>
          {selectedMonster.userId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={selectedMonster?.monsterId === undefined || !selectedMonster.userId}>
        Убить
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </>
  );
};
