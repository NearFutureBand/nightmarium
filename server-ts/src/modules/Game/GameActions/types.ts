import { AbilityMessagePayload, LegionMessagePayload, Message } from 'src/types';

export type PutCardReturnType =
  | Message
  | Message<{ legion: LegionMessagePayload }>
  | Message<{ ability: AbilityMessagePayload }>
  | undefined;
