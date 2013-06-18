function DataService() {
  this.all = function () {
    var all = [];
    for (var name in localStorage) {
      all.push(this.load(name));
    }
    return all;
  };

  this.load = function(name) {
    return new Inputs(name, angular.fromJson(localStorage.getItem(name)));
  };

  this.save = function(inputs) {
    if (inputs.name != inputs.originalName) {
      localStorage.removeItem(inputs.originalName);
    }
    inputs.originalName = inputs.name;
    localStorage.setItem(inputs.name, angular.toJson(inputs.persistentData()));
    return inputs;
  };
}

function makePersistable(defaults) {
  this.defaults = defaults;
  this.persistentData = function() {
    persistentData = {};
    for (key in defaults) {
      persistentData[key] = this[key];
    }
    return persistentData;
  }
}
