function Payment(id, persistentData) {
  this.id = id || "payment." + uuid();
  angular.extend(this, this.defaults);
  angular.extend(this, persistentData);
}

Payment.prototype.paymentRate = function() { return this.interestRate + this.amortizationRate; };

makePersistable.call(Payment.prototype, {
  name:             "Unbenannt",
  capital:          100000.0,
  interestRate:     3.0,
  amortizationRate: 1.0,
});
