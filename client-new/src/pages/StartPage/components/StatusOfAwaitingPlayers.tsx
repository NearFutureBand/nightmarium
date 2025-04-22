import { useWebsocket } from 'src/modules/websocket';

export function StatusOfAwaitingPlayers() {
  const otherPlayers = useWebsocket((state) => state.otherPlayers);
  const amIReadyToPlay = useWebsocket((state) => state.me?.readyToPlay);

  const readyToPlayCount =
    otherPlayers.reduce((count, player) => (player.readyToPlay ? count + 1 : count), 0) +
    (amIReadyToPlay ? 1 : 0);

  return (
    <>
      Готово игроков: {readyToPlayCount}/{otherPlayers.length + 1}
    </>
  );
}
