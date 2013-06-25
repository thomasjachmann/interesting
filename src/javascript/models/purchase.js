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
Purchase.prototype.firstPaymentAt = function() {
  var timestamp = Date.parse(this.purchaseDate);
  var date = isNaN(timestamp) ? new Date() : new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

makePersistable(Purchase, {
  name:         "",
  price:        0.0,
  addOns:       0.0,
  tax:          5.0,
  notary:       1.5,
  brokerage:    6.25,
  purchaseDate: "",
});
