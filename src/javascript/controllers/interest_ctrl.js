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

  var calculationTimer, processData;
  $scope.calculate = function() {
    if ($scope.purchases.selected && $scope.financings.selected) {
      $timeout.cancel(calculationTimer);
      $scope.purchases.saveSelected();
      $scope.financings.saveSelected();
      $scope.months = null;
      $scope.processing = true;
      processData = {
        months: [],
        month: null,
        balance: $scope.credit(),
      };
      calculationTimer = $timeout(processNextMonth, 100);
    }
  };

  function processNextMonth(times) {
    times = times || 0;
    if (processData.balance > 0) {
      var month = new Month(processData.balance, $scope.monthlyPayment(), $scope.financings.selected.interestRate / 100.0);
      processData.balance = month.remainder;
      processData.months.push(month);
      if (times < 6) {
        processNextMonth(times + 1);
      } else {
        calculationTimer = $timeout(processNextMonth, 0);
      }
    } else {
      $scope.totalInterest = 0;
      $scope.totalPayments = 0;
      for (var month in processData.months) {
        $scope.totalInterest += processData.months[month].interest;
        $scope.totalPayments += processData.months[month].payment;
      };
      $scope.months = processData.months;
      $scope.processing = false;
      processData = null;
    }
  }
}
