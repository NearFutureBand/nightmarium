import { Card } from 'src/types';

export type AbilityState = {
  type: number | null;
  index: number; // Индекс способности в монстре ( 0 - 3 )
  done: boolean; // Выполнена способность или нет - в целом пока бесполезно
  inprogress: boolean;
  actions: number; // Сколько действий осталось внутри этой способности, нужно для сложных сп. таких как Волк
  cards?: Card[]; // Карты, выдаваемые внутри способности. Будут храниться здесь, чтобы оперировать только индексами карт
};
