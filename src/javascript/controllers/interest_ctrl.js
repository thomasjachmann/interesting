function InterestCtrl($scope, $timeout, dataService) {

  $scope.add = function() {
    $scope.allInputs.push(new Inputs());
    $scope.select($scope.allInputs.length - 1);
  };

  $scope.select = function(index) {
    $scope.inputs = $scope.allInputs[index]
    $scope.outputs = new Outputs();
    $scope.calculate();
  }

  $scope.save = function() {
    dataService.save($scope.inputs);
  };

  var calculationTimer = null;
  $scope.calculate = function() {
    $timeout.cancel(calculationTimer);
    $scope.save();
    var inputs   = $scope.inputs,
        outputs  = $scope.outputs;
    outputs.brokerageCost  = inputs.price * inputs.brokerage / 100.0;
    outputs.taxCost        = inputs.price * inputs.tax / 100.0;
    outputs.notaryCost     = inputs.price * inputs.notary / 100.0;
    outputs.cost           = inputs.price + outputs.brokerageCost + outputs.taxCost + outputs.notaryCost + inputs.addOns;
    outputs.credit         = outputs.cost - inputs.capital;
    outputs.payment        = Math.round(outputs.credit * (inputs.interestRate + inputs.amortizationRate) / 12) / 100.0;
    $scope.months = null;
    $scope.processing = {
      months: [],
      month: null,
      balance: outputs.credit,
    };
    calculationTimer = $timeout(processNextMonth, 100);
  };

  function processNextMonth(times) {
    times = times || 0;
    var data = $scope.processing;
    if (data.balance > 0) {
      var month = new Month(data.balance, $scope.outputs.payment, $scope.inputs.interestRate / 100.0);
      data.balance = month.remainder;
      data.months.push(month);
      if (times < 6) {
        processNextMonth(times + 1);
      } else {
        calculationTimer = $timeout(processNextMonth, 0);
      }
    } else {
      $scope.outputs.totalInterest = 0;
      $scope.outputs.totalPayments = 0;
      for (var month in data.months) {
        $scope.outputs.totalInterest += data.months[month].interest;
        $scope.outputs.totalPayments += data.months[month].payment;
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
