function Payment(id, persistentData) {
  this.initialize(id, persistentData);
}

Payment.prototype.paymentRate = function() { return this.interestRate + this.amortizationRate; };

makePersistable(Payment, {
  name:             "Unbenannt",
  capital:          100000.0,
  interestRate:     3.0,
  amortizationRate: 1.0,
});
