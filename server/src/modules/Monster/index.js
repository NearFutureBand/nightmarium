class Monster {
  constructor(id, body = []) {
    this.id = id;
    this.body = body;
    this.abilitiesUsed = false;
  }
}

module.exports = Monster;