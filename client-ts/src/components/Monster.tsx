import classNames from 'classnames';
import { PropsWithChildren, useState } from 'react';

type Props = {};

export const Monster = ({ children }: PropsWithChildren<Props>) => {
  //const [draggedOver, setDraggedOver] = useState(false);

  return (
    <div
      className={classNames('monster')}
      // onDragEnter={() => setDraggedOver(true)}
      // onDragLeave={() => setDraggedOver(false)}
    >
      {children}
    </div>
  );
};
