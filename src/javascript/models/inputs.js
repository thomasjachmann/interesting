function Inputs(id, persistentData) {
  this.id = id || "inputs." + uuid();
  angular.extend(this, this.defaults);
  angular.extend(this, persistentData);
  angular.extend(this, {
    brokerageCost:  function() { return this.price * this.brokerage / 100.0; },
    taxCost:        function() { return this.price * this.tax / 100.0; },
    notaryCost:     function() { return this.price * this.notary / 100.0; },
    cost:           function() { return this.price + this.brokerageCost() + this.taxCost() + this.notaryCost() + this.addOns; },
    credit:         function() { return this.cost() - this.capital; },
    payment:        function() { return Math.round(this.credit() * (this.interestRate + this.amortizationRate) / 12) / 100.0; }
  });
}

makePersistable.call(Inputs.prototype, {
  name:             "Unbenannt",
  price:            450000.0,
  brokerage:        6.25,
  tax:              5.0,
  notary:           1.5,
  addOns:           0.0,
  capital:          100000.0,
  interestRate:     3.0,
  amortizationRate: 1.0,
});
