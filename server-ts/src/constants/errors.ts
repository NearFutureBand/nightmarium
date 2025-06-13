export type Err =
  | 'no_active_player'
  | 'active_player_and_legion_player_mismatch'
  | 'no_handler_for_message'
  | 'not_found_monster_by_id'
  | 'abilities_mode_is_not_active'
  | 'index_of_abilities_is_null'
  | 'ability_state_is_null'
  | 'no_cards_given_for_drop_ability';

const ERRORS_MESSAGES: Record<Err, (params?: Record<string, string>) => string> = {
  no_active_player: ({ requestedPlayerId, realPlayerId } = {}) =>
    `Not found active player with id: ${requestedPlayerId}. Current active player is ${realPlayerId}`,
  active_player_and_legion_player_mismatch: () => 'Current legion player is not the active player',
  no_handler_for_message: ({ messageType } = {}) =>
    `Not found a handler for message ${messageType}`,
  not_found_monster_by_id: ({ monsterId } = {}) => `Not found monster with id: ${monsterId}`,
  abilities_mode_is_not_active: () => 'abilities_mode_is_not_active',
  index_of_abilities_is_null: () => 'index_of_abilities_is_null',
  ability_state_is_null: () => 'ability_state_is_null',
  no_cards_given_for_drop_ability: () => 'no_cards_given_for_drop_ability'
};

/** @todo add place where the error is generated */
export function generateError(errorName: Err, artifacts?: Record<string, string>) {
  return { error: true, message: ERRORS_MESSAGES[errorName](artifacts) };
}
