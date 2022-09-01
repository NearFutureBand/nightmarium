import { FC } from 'react';

type Props = {};

export const Loading: FC<Props> = ({}) => {
  return (
    <div className="loading">
      <div>Идёт обновление идентификатора игрока</div>
    </div>
  );
};
