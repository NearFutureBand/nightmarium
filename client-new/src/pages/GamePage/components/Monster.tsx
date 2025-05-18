import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';
import { useDragndrop } from 'src/modules/dragndrop';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';

export const Monster = ({
  children,
  id,
  onClick,
  isSelected = false,
  selectable = false,
  isActive = false
}: PropsWithChildren<{
  id: number;
  onClick?: () => void;
  isSelected?: boolean;
  selectable?: boolean;
  isActive?: boolean;
}>) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const draggedCard = useDragndrop((s) => s.draggedCard);
  const sendMessage = useSendMessage();
  const gameId = useGameId();

  const handleBuildMonster = () => {
    if (!draggedCard || !gameId) return;
    setIsDraggedOver(false);
    sendMessage({ type: 'PLAY_CARD', cardId: draggedCard.id, monsterId: id, gameId });
  };

  return (
    <div
      onDragEnter={() => setIsDraggedOver(true)}
      onDragLeave={() => setIsDraggedOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleBuildMonster}
      className={clsx(
        'aspect-[204/393] rounded-3xl flex-1 empty:border flex flex-col-reverse min-w-[200px] max-w-[300px] shrink-0',
        selectable ? 'cursor-pointer' : 'cursor-not-allowed',
        (isDraggedOver || isSelected) && 'bg-accent-500',
        isActive && 'active-monster'
      )}
      onClick={onClick}>
      {children}
    </div>
  );
};
