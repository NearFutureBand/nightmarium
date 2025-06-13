import { Card } from 'src/types';

export type AbilityName = 'WOLF' | 'DROP' | 'SMILE' | 'AXE' | 'BONES' | 'TEETH';

export type AbilityState = {
  type: number;
  index: number; // Индекс способности в монстре ( 0 - 3 )
  // done: boolean; // Выполнена способность или нет - в целом пока бесполезно
  // inprogress: boolean;
  actions: number; // Сколько действий осталось внутри этой способности, нужно для сложных сп. таких как Волк
  cards?: Card[]; // Карты, выдаваемые внутри способности. Будут храниться здесь, чтобы оперировать только индексами карт
};

export type AbilityStateSerialized = {
  cards?: Card[];
  abilityNumber: number;
  abilityType: number;
  actions: number;
  monsterId: number;
};

export type PrepareNextAbilityResult = {
  noAbilitiesLeft?: boolean;
  continueAbilities?: boolean;
  ability?: AbilityStateSerialized;
};
