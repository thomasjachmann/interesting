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

  var calculationTimer = null;
  $scope.calculate = function() {
    $timeout.cancel(calculationTimer);
    $scope.save();
    var inputs   = $scope.inputs;
    $scope.months = null;
    $scope.processing = {
      months: [],
      month: null,
      balance: inputs.credit(),
    };
    calculationTimer = $timeout(processNextMonth, 100);
  };

  function processNextMonth(times) {
    times = times || 0;
    var data = $scope.processing;
    if (data.balance > 0) {
      var month = new Month(data.balance, $scope.inputs.payment(), $scope.inputs.interestRate / 100.0);
      data.balance = month.remainder;
      data.months.push(month);
      if (times < 6) {
        processNextMonth(times + 1);
      } else {
        calculationTimer = $timeout(processNextMonth, 0);
      }
    } else {
      $scope.inputs.totalInterest = 0;
      $scope.inputs.totalPayments = 0;
      for (var month in data.months) {
        $scope.inputs.totalInterest += data.months[month].interest;
        $scope.inputs.totalPayments += data.months[month].payment;
      };
      $scope.months = data.months;
      $scope.processing = null;
      $scope.$apply();
    }
  }

  $scope.allInputs = dataService.all();
  if ($scope.allInputs.length == 0) {
    $scope.add();
  }
  $scope.select(0);

}
