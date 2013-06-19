function InterestCtrl($scope, $timeout, dataService) {

  $scope.add = function() {
    $scope.allInputs.push(new Inputs());
    $scope.select($scope.allInputs.length - 1);
  };

  $scope.select = function(index) {
    $scope.inputs = $scope.allInputs[index]
    $scope.calculate();
  }

  $scope.save = function() {
    dataService.save($scope.inputs);
  };

  var calculationTimer, processData;
  $scope.calculate = function() {
    $timeout.cancel(calculationTimer);
    $scope.save();
    var inputs   = $scope.inputs;
    $scope.months = null;
    $scope.processing = true;
    processData = {
      months: [],
      month: null,
      balance: inputs.credit(),
    };
    calculationTimer = $timeout(processNextMonth, 100);
  };

  function processNextMonth(times) {
    times = times || 0;
    if (processData.balance > 0) {
      var month = new Month(processData.balance, $scope.inputs.payment(), $scope.inputs.interestRate / 100.0);
      processData.balance = month.remainder;
      processData.months.push(month);
      if (times < 6) {
        processNextMonth(times + 1);
      } else {
        calculationTimer = $timeout(processNextMonth, 0);
      }
    } else {
      $scope.inputs.totalInterest = 0;
      $scope.inputs.totalPayments = 0;
      for (var month in processData.months) {
        $scope.inputs.totalInterest += processData.months[month].interest;
        $scope.inputs.totalPayments += processData.months[month].payment;
      };
      $scope.months = processData.months;
      $scope.processing = false;
      processData = null;
    }
  }

  $scope.allInputs = dataService.all();
  if ($scope.allInputs.length == 0) {
    $scope.add();
  }
  $scope.select(0);

}
