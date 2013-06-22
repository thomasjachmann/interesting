function Payment(date, amount, previousBalance, interestRate) {
  this.date             = date;
  this.amount           = amount;
  this.previousBalance  = previousBalance;
  this.interestRate     = interestRate;
  this.interest         = Math.round(this.previousBalance * this.interestRate / 12 * 100) / 100.0;
  this.amortization     = Math.min(this.amount - this.interest, this.previousBalance);
  this.payment          = this.interest + this.amortization; // recalculate basically just for the last month
  this.newBalance       = this.previousBalance - this.amortization;
}
