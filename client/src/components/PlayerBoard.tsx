import classNames from "classnames";
import { FC } from "react";
import { useAppSelector } from "src/hooks/useAppSelector";
import { selectIsActive } from "src/slices/App";
import { Card, Player } from "src/types";
import { CardView } from "./CardView";
import { MonsterView } from "./MonsterView";

type Props = {
  player: Player;
  isMe: boolean;
};

export const PlayerBoard: FC<Props> = ({ player, isMe = false }) => {
  const isActive = useAppSelector(selectIsActive(player.id));
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);

  return (
    <div
      className={classNames("playerBoard", {
        active: isActive,
        winner: winnerId === player.id,
      })}
    >
      <header>
        {player.name} {player.id} {isMe && "( я )"}{" "}
        {!isMe && `Карт: ${player.cards}`}
      </header>
      <div className='monsters'>
        {player.monsters.map((monster) => (
          <MonsterView
            key={monster.id}
            monster={monster}
            player={player}
            isMe={isMe}
          >
            {[0, 1, 2].map((bodypartIndex) => {
              const card: Card | undefined = monster?.body[bodypartIndex];
              return (
                <CardView
                  card={card}
                  key={bodypartIndex}
                  monster={monster}
                  player={player}
                  isMe={isMe}
                />
              );
            })}
          </MonsterView>
        ))}
      </div>
    </div>
  );
};
