function Inputs(name, persistentData) {
  this.name = name || "Unbenannt";
  this.originalName = this.name;
  angular.extend(this, this.defaults);
  angular.extend(this, persistentData);
}

makePersistable.call(Inputs.prototype, {
  price:            450000.0,
  brokerage:        6.25,
  tax:              5.0,
  notary:           1.5,
  addOns:           0.0,
  capital:          100000.0,
  interestRate:     3.0,
  amortizationRate: 1.0,
});
