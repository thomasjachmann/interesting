function Purchase(id, persistentData) {
  this.initialize(id, persistentData);
}

Purchase.prototype.taxCost = function() {
  return this.price * this.tax / 100.0;
};
Purchase.prototype.notaryCost = function() {
  return this.price * this.notary / 100.0;
};
Purchase.prototype.brokerageCost = function() {
  return this.price * this.brokerage / 100.0;
};
Purchase.prototype.totalCost = function() {
  return this.price + this.addOns + this.taxCost() + this.notaryCost() + this.brokerageCost();
};

makePersistable(Purchase, {
  name:       "",
  price:      400000.0,
  addOns:     0.0,
  tax:        5.0,
  notary:     1.5,
  brokerage:  6.25,
});
