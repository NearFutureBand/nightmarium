import { FC } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectHowManyReadyToPlay } from '../slices/App';
import { Loading } from './Loading';

export const LoadingScreen: FC = () => {
  const otherPlayers = useAppSelector((state) => state.app.otherPlayers);
  const readyToPlayCount = useAppSelector(selectHowManyReadyToPlay);

  return (
    <div className="loadingScreen">
      <div className="main">
        <Loading />
        <div>
          <h1>Ожидание игроков</h1>
          Готовы: {readyToPlayCount}/{otherPlayers.length + 1}
        </div>
      </div>

      <small className="hint">
        Когда кто-то собирает монстра одного легиона и нужно сбросить карту этого цвета - вы можете как сбросить одну карту, подходящую по легиону, так и две
        другие любых других цветов. Можно сбрасывать две карты, даже если у вас есть одна подходящая.
      </small>
    </div>
  );
};
