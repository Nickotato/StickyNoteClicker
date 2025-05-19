export class WorkerClass {
  constructor({
    id,
    name,
    description,
    _cost,
    produce,
    owned = 0,
    visible = false,
    efficiency = 1,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this._cost = _cost;
    this.produce = produce;
    this.owned = owned;
    this.visible = visible;
  }

  get cost() {
    return this._cost * Math.pow(1.15, this.owned);
  }

  toJSON() {
    return {
      id: this.id,
      owned: this.owned,
      visible: this.visible,
    };
  }

  static fromJSON(id, jsonData, defaults) {
    return new WorkerClass({
      ...defaults[id],
      owned: jsonData.owned,
      visible: jsonData.visible,
    });
  }
}
