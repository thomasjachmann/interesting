function Cost(id, persistentData) {
  this.initialize(id, persistentData);
}

Cost.prototype.brokerageCost  = function() { return this.price * this.brokerage / 100.0; };
Cost.prototype.taxCost        = function() { return this.price * this.tax / 100.0; };
Cost.prototype.notaryCost     = function() { return this.price * this.notary / 100.0; };
Cost.prototype.cost           = function() { return this.price + this.brokerageCost() + this.taxCost() + this.notaryCost() + this.addOns; };

makePersistable(Cost, {
  name:       "Unbenannt",
  price:      450000.0,
  brokerage:  6.25,
  tax:        5.0,
  notary:     1.5,
  addOns:     0.0,
});
