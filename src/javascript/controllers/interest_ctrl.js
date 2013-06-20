function InterestCtrl($scope, $timeout, dataService) {

  $scope.addCost = function() {
    var cost = new Cost();
    dataService.save(cost);
    $scope.costs.push(cost);
    $scope.selectCost($scope.costs.length - 1);
  };

  $scope.selectCost = function(index) {
    $scope.selectedCost = $scope.costs[index];
    return $scope.selectedCost;
  }

  $scope.saveCost = function() {
    dataService.save($scope.selectedCost);
  };

  $scope.addPayment = function() {
    var payment = new Payment();
    dataService.save(payment);
    $scope.payments.push(payment);
    $scope.selectPayment($scope.payments.length - 1);
  };

  $scope.selectPayment = function(index) {
    $scope.selectedPayment = $scope.payments[index];
    return $scope.selectPayment;
  }

  $scope.savePayment = function() {
    dataService.save($scope.selectedPayment);
  };

  $scope.credit = function() {
    return $scope.selectedCost.cost() - $scope.selectedPayment.capital;
  };

  $scope.payment = function() {
    var yearlyPayment = $scope.credit() * $scope.selectedPayment.paymentRate() / 100.0;
    return Math.round(yearlyPayment / 12);
  };

  var calculationTimer, processData;
  $scope.calculate = function() {
    $timeout.cancel(calculationTimer);
    $scope.saveCost();
    $scope.savePayment();
    $scope.months = null;
    $scope.processing = true;
    processData = {
      months: [],
      month: null,
      balance: $scope.credit(),
    };
    calculationTimer = $timeout(processNextMonth, 100);
  };

  function processNextMonth(times) {
    times = times || 0;
    if (processData.balance > 0) {
      var month = new Month(processData.balance, $scope.payment(), $scope.selectedPayment.interestRate / 100.0);
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

  $scope.costs = dataService.all(Cost);
  if ($scope.costs.length == 0) {
    $scope.addCost();
  }
  $scope.selectCost(0);

  $scope.payments = dataService.all(Payment);
  if ($scope.payments.length == 0) {
    $scope.addPayment();
  }
  $scope.selectPayment(0);

  $scope.calculate();

}
