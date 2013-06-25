function Financing(id, persistentData) {
  this.initialize(id, persistentData);
}

Financing.prototype.paymentRate = function() {
  return this.interestRate + this.amortizationRate;
};

makePersistable(Financing, {
  name:                     "",
  capital:                  0.0,
  interestRate:             3.0,
  amortizationRate:         1.0,
  optionalAmortizationRate: 5.0,
});
