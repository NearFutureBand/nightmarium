const { WebSocketServer } = require('ws');
const _ = require('lodash');

const { CARDS } = require("./src/modules/Cards");
const Game = require("./src/modules/Game");
const Player = require("./src/modules/Player");
const { randomInteger } = require("./src/helpers");

const ABILITIES = {
  0: "Волк",
  1: "Капля",
  2: "Улыбка",
  3: "Топор",
  4: "Кости",
  5: "Зубы"
}

const BODYPARTS = {
  0: "Ноги",
  1: "Туловище",
  2: "Голова"
}

const game = new Game();

let abilitiesState = {};

const onAbility = () => {
  const ability = abilitiesState.abilities[abilitiesState.currentAbilityIndex];
  ability.inprogress = true;

  console.log("abilities state", abilitiesState);

  let payload = {};
  switch (ability.type) {
    case 0: {
      // волк
      // выдать две карты чтобы игрок сразу попытался их применить
      payload.cards = [Game.giveCard(), Game.giveCard()];
    }
    case 1: {
      // взять две карты на руку
      payload.cards = [Game.giveCard(), Game.giveCard()];
    }
  }

  payload.abilityNumber = abilitiesState.currentAbilityIndex;
  payload.abilityType = ability.type;

  game.players.forEach(player => {
    player.sendMessage("AWAIT_ABILITY", { game: game.getGame(), ...payload });
  });
}

const wsServer = new WebSocketServer({ host: 'localhost', port: 9000 });
wsServer.on('connection', (wsClient) => {

  const id = Math.random();
  console.log(`new client is connected ${id}`);

  const newPlayer = new Player(id, wsClient);
  newPlayer.cards = Game.giveDefaulCards();
  game.addPlayer(newPlayer);
  newPlayer.sendMessage("CONNECTION", { playerId: id, game: game.getGame() });

  wsClient.on("message", (event) => {
    const message = JSON.parse(event);
    console.log("message", message);

    if (message.type === "RECONNECT") {
      // FE sends id from localstorage
      // set wsClient to the player with given id
    }

    if (message.type === "REGISTRATION") {
      // message: {id, name}
      // setName
    }

    if (message.type === "START") {
      game.setNextActivePlayer();
    }

    if (message.type === "TAKE_CARD") {
      const availableCards = Object.values(game.cardsAvailable);
      if (availableCards.length === 0) {
        return;
      }
      const newCardIndex = randomInteger(0, availableCards.length - 1);
      const newCard = availableCards[newCardIndex];
      delete game.cardsAvailable[newCard.id];
      game.activePlayer.cards.push(newCard);
      game.actions -= 1;

      if (game.actions === 0) {
        game.setNextActivePlayer();
      }
    }

    if (message.type === "PLAY_CARD") {
      const targetMonster = game.activePlayer.monsters[message.monsterId];
      const cardIndex = game.activePlayer.cards.findIndex(card => card.id === message.cardId);
      const card = game.activePlayer.cards[cardIndex];

      const possibleToInstall = card.bodypart.some(bodypartIndex => bodypartIndex === targetMonster.body.length);

      if (!possibleToInstall) {
        return;
      }
      

      game.activePlayer.cards.splice(cardIndex, 1);
      targetMonster.body.push(card);
      game.actions -= 1;

      if (targetMonster.body.length === 3) {
        // monster has been built
        console.log(targetMonster.body);
        abilitiesState.playerId = game.activePlayer.id;
        abilitiesState.monsterId = targetMonster.id;
        abilitiesState.abilities = [...targetMonster.body].reverse().map((bodypart, index) => ({ type: bodypart.ability, done: false, inprogress: false }));
        abilitiesState.currentAbilityIndex = 0;
        onAbility();
        return;
      }

      if (game.actions === 0) {
        game.setNextActivePlayer();
      }
    }

    if (message.type === "SUBMIT_ABILITY") {
      const ability = abilitiesState.abilities[abilitiesState.currentAbilityIndex]
      switch (ability.type) {
        case 1: {
          // additional payload: { cards: [...] }
          // TODO жуткий говнокод, как и все здесь пока
          game.activePlayer.cards.push(message.cards[0]);
          game.activePlayer.cards.push(message.cards[1]);
          break;
        }
        case 2: {
          // additional payload: { cardId, monsterId }
          const { cardId, monsterId } = message;
          if (typeof cardId === "number" && typeof monsterId === "number") {
            // TODO сделать функцию addCardToMonster
            const targetMonster = game.activePlayer.monsters[monsterId];
            const cardIndex = game.activePlayer.cards.findIndex(card => card.id === cardId);
            const card = game.activePlayer.cards[cardIndex];
            const possibleToInstall = card.bodypart.some(bodypartIndex => bodypartIndex === targetMonster.body.length);
            if (possibleToInstall) {
              game.activePlayer.cards.splice(cardIndex, 1);
              targetMonster.body.push(card);
            }
          }
          break;
        }
        case 3: {
          // топор, additional payload { cardId, targetPlayerId, targetMonsterId }
          // забрать верхнюю карту чужого монстра на руку
          const { cardId, targetPlayerId, targetMonsterId } = message;
          const targetPlayer = game.getPlayerById(targetPlayerId);

          const targetMonster = targetPlayer.monsters[targetMonsterId];
          const [ removedCard ] = targetMonster.body.splice(targetMonster.body.length - 1, 1);
          game.activePlayer.cards.push(removedCard);
          break;
        }
        case 4: {
          // additional payload { targetPlayerId, targetMonsterId }
          // кости, уничтожить недостроенного монстра целиком
          const { targetPlayerId, targetMonsterId } = message;
          const targetPlayer = game.getPlayerById(targetPlayerId);

          const targetMonster = targetPlayer.monsters[targetMonsterId];
          const removedCards = targetMonster.body.splice(0, targetMonster.body.length);

          removedCards.forEach(card => {
            game.cardsThrowedAway[card.id] = card;
          });
          break;
        }
        case 5: {
          // additional payload: { cardId, targetMonsterId }
          // уничтожить верхнюю карту своего монстра, кроме текущего
          // const activeMonster
          const { cardId } = message;
          const targetMonster = game.activePlayer.monsters.find(monster => monster.body.find(card => card.id === cardId));

          const removedCard = targetMonster.body.splice(targetMonster.body.length - 1, 1);
          game.cardsThrowedAway[removedCard.id] = removedCard;
          break;
        }
      }
      ability.done = true;
      ability.inprogress = false;
      abilitiesState.currentAbilityIndex++;

      if (abilitiesState.currentAbilityIndex === 3) {
        abilitiesState = {};


        if (game.actions === 0) {
          game.setNextActivePlayer();
        }

        game.players.forEach(player => {
          player.sendMessage("MONSTER_COMPLETED", { game: game.getGame() });
        });
        return;
      }
      onAbility();
      return;
    }

    game.players.forEach(player => {
      player.sendMessage(message.type, { game: game.getGame() });
    });
  });

  wsClient.on("close", () => {
    console.log(`${id} disconnected`);
    // const disconnectedPlayer = game.getPlayerById(id);
    // disconnectedPlayer.unsetWsClient();
  });
});