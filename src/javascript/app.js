var app = angular.module("app", []);
app.service("dataService", DataService);
app.controller("interestCtrl", InterestCtrl);
app.filter("percent", function() {
  return function(data) {
    return data + " %";
  };
});

//http://jsfiddle.net/simpulton/XqDxG/

function uuid() {
  var s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}
