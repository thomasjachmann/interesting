function InterestCtrl($scope, $timeout, purchaseSelectionService, financingSelectionService) {
  $scope.purchases = purchaseSelectionService;
  $scope.financings = financingSelectionService;

  $scope.credit = function() {
    if ($scope.purchases.selected && $scope.financings.selected) {
      return $scope.purchases.selected.totalCost() - $scope.financings.selected.capital;
    }
  };

  $scope.monthlyPayment = function() {
    if ($scope.financings.selected) {
      var yearlyPayment = $scope.credit() * $scope.financings.selected.paymentRate() / 100.0;
      return Math.round(yearlyPayment / 12);
    }
  };

  $scope.optionalYearlyPayment = function() {
    if ($scope.financings.selected) {
      return $scope.credit() * $scope.financings.selected.optionalAmortizationRate / 100.0;
    }
  }

  var calculationTimer, processData;
  $scope.calculate = function() {
    if ($scope.purchases.selected && $scope.financings.selected) {
      $timeout.cancel(calculationTimer);
      $scope.purchases.saveSelected();
      $scope.financings.saveSelected();
      $scope.payments = null;
      $scope.processing = true;
      processData = {
        payments: [],
        payment: null,
        date: $scope.purchases.selected.firstPaymentAt(),
        balance: $scope.credit(),
      };
      calculationTimer = $timeout(calculateNextPayment, 100);
    }
  };

  function calculateNextPayment(times) {
    times = times || 0;
    if (processData.balance > 0) {
      var amount = $scope.monthlyPayment();
      if (processData.date.getMonth() == 11) {
        amount += $scope.optionalYearlyPayment();
      }
      var payment = new Payment(processData.date, amount, processData.balance, $scope.financings.selected.interestRate / 100.0);
      processData.date = new Date(payment.date.getFullYear(), payment.date.getMonth() + 1, 1);
      processData.balance = payment.newBalance;
      processData.payments.push(payment);
      if (times < 6) {
        calculateNextPayment(times + 1);
      } else {
        calculationTimer = $timeout(calculateNextPayment, 0);
      }
    } else {
      $scope.totalInterest = 0;
      $scope.totalPayments = 0;
      for (var payment in processData.payments) {
        $scope.totalInterest += processData.payments[payment].interest;
        $scope.totalPayments += processData.payments[payment].payment;
      };
      $scope.payments = processData.payments;
      $scope.processing = false;
      processData = null;
    }
  }
}
