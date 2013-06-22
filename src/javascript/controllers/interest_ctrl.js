function InterestCtrl($scope, $timeout, dataService) {

  $scope.addPurchase = function() {
    var purchase = new Purchase();
    dataService.save(purchase);
    $scope.purchases.push(purchase);
    $scope.selectPurchase($scope.purchases.length - 1);
  };

  $scope.selectPurchase = function(index) {
    $scope.selectedPurchase = $scope.purchases[index];
    return $scope.selectedPurchase;
  }

  $scope.savePurchase = function() {
    dataService.save($scope.selectedPurchase);
  };

  $scope.addFinancing = function() {
    var financing = new Financing();
    dataService.save(financing);
    $scope.financings.push(financing);
    $scope.selectFinancing($scope.financings.length - 1);
  };

  $scope.selectFinancing = function(index) {
    $scope.selectedFinancing = $scope.financings[index];
    return $scope.selectFinancing;
  }

  $scope.saveFinancing = function() {
    dataService.save($scope.selectedFinancing);
  };

  $scope.credit = function() {
    return $scope.selectedPurchase.totalCost() - $scope.selectedFinancing.capital;
  };

  $scope.monthlyPayment = function() {
    var yearlyPayment = $scope.credit() * $scope.selectedFinancing.paymentRate() / 100.0;
    return Math.round(yearlyPayment / 12);
  };

  var calculationTimer, processData;
  $scope.calculate = function() {
    $timeout.cancel(calculationTimer);
    $scope.savePurchase();
    $scope.saveFinancing();
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
      var month = new Month(processData.balance, $scope.monthlyPayment(), $scope.selectedFinancing.interestRate / 100.0);
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

  $scope.purchases = dataService.all(Purchase);
  if ($scope.purchases.length == 0) {
    $scope.addPurchase();
  }
  $scope.selectPurchase(0);

  $scope.financings = dataService.all(Financing);
  if ($scope.financings.length == 0) {
    $scope.addFinancing();
  }
  $scope.selectFinancing(0);

  $scope.calculate();

}
