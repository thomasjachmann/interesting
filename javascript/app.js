'use strict';

function Month(balance, payment, interestRate) {
  this.balance      = balance;
  this.interestRate = interestRate;
  this.interest     = this.balance * this.interestRate / 12;
  this.amortization = Math.min(payment - this.interest, this.balance);
  this.payment      = this.interest + this.amortization;
  this.remainder    = this.balance - this.amortization;
}

function InterestCtrl($scope, $locale) {
  // setup defaults
  $scope.inputs = {
    price:            450000,
    brokerage:        6.25,
    tax:              5.0,
    notary:           1.5,
    capital:          100000,
    interestRate:     3.0,
    amortizationRate: 1.0
  };
  $scope.calculated = {
    brokerageCost:    0,
    taxCost:          0,
    notaryCost:       0,
    cost:             0,
    credit:           0,
    payment:          0,
    totalPayments:    0
  }
  $scope.months = null;
  $scope.processing = null;

  $scope.calculate = function() {
    if ($scope.processing) {
      clearTimeout($scope.processing.timeout);
    }
    var inputs      = $scope.inputs,
        calculated  = $scope.calculated;
    calculated.brokerageCost  = inputs.price * inputs.brokerage / 100.0;
    calculated.taxCost        = inputs.price * inputs.tax / 100.0;
    calculated.notaryCost     = inputs.price * inputs.notary / 100.0;
    calculated.cost           = inputs.price + calculated.brokerageCost + calculated.taxCost + calculated.notaryCost;
    calculated.credit         = calculated.cost - inputs.capital;
    calculated.payment        = calculated.credit * (inputs.interestRate + inputs.amortizationRate) / 100.0 / 12;
    $scope.processing = {
      months: [],
      month: null,
      balance: calculated.credit,
      timeout: setTimeout(processNextMonth, 0)
    };
  };

  function processNextMonth() {
    var data = $scope.processing;
    if (data.balance > 0) {
      var month = new Month(data.balance, $scope.calculated.payment, $scope.inputs.interestRate / 100.0);
      data.balance = month.remainder;
      data.months.push(month);
      data.timeout = setTimeout(processNextMonth, 0);
    } else {
      $scope.calculated.totalPayments = 0;
      for (var month in data.months) {
       $scope.calculated.totalPayments += data.months[month].payment;
      };
      $scope.months = data.months;
      $scope.processing = null;
      $scope.$apply();
    }
  }

  $scope.calculate();
}
