function Month(balance, payment, interestRate) {
  this.balance      = balance;
  this.interestRate = interestRate;
  this.interest     = Math.round(this.balance * this.interestRate / 12 * 100) / 100.0;
  this.amortization = Math.min(payment - this.interest, this.balance);
  this.payment      = this.interest + this.amortization;
  this.remainder    = this.balance - this.amortization;
}
