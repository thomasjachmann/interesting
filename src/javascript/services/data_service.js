function DataService() {
  this.all = function (type) {
    var all = [];
    for (var id in localStorage) {
      if (id.match(new RegExp("^" + type.name.toLowerCase() + "\.[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$"))) {
        all.push(this.load(type, id));
      }
    }
    all.sort(function(a, b) {
      if (a.name < b.name) {
          return -1;
      } else if (a.name > b.name) {
          return 1
      } else {
          return 0;
      }
    });
    return all;
  };

  this.load = function(type, id) {
    return new type(id, angular.fromJson(localStorage.getItem(id)));
  };

  this.save = function(obj) {
    localStorage.setItem(obj.id, angular.toJson(obj.persistentData()));
    return obj;
  };

  // an array defining migration functions where:
  // - key is the version from which to migrate
  // - value is the function doing the migration and returning the version that
  //   was migrated to
  var migrations = {
    null: function() {
      var data;
      for (var name in localStorage) {
        data = angular.fromJson(localStorage.getItem(name));
        data.name = name;
        localStorage.setItem("inputs." + uuid(), angular.toJson(data));
        localStorage.removeItem(name);
      }
      return "1";
    },
    1: function() {
      var match, data;
      for (var id in localStorage) {
        match = id.match(/^inputs\.([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})$/)
        if (match) {
          data = localStorage.getItem(id);
          localStorage.setItem("cost." + match[1], data);
          localStorage.removeItem(id);
        }
      }
      return "2";
    },
    2: function () {
      var match, data, costData, paymentData;
      for (var id in localStorage) {
        match = id.match(/^cost\.[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/)
        if (match) {
          data = angular.fromJson(localStorage.getItem(id));
          costData = {};
          paymentData = {};
          for (var key in data) {
            if (["capital", "interestRate", "amortizationRate"].indexOf(key) == -1) {
              costData[key] = data[key];
            } else {
              paymentData[key] = data[key];
            }
          }
          paymentData.name = data.name;
          localStorage.setItem(id, angular.toJson(costData));
          localStorage.setItem("payment." + uuid(), angular.toJson(paymentData));
        }
      }
      return "3";
    }
  };

  this.migrate = function() {
    var schemaVersion = localStorage.getItem("schemaVersion"),
        migration, newSchemaVersion;

    do {
      migration = migrations[schemaVersion];
      if (migration === undefined) {
        break;
      }
      newSchemaVersion = migration();
      console.log("migrated schema from version " + schemaVersion + " to version " + newSchemaVersion);
      schemaVersion = newSchemaVersion;
    } while (true);

    if (schemaVersion)
      localStorage.setItem("schemaVersion", schemaVersion);
  };

  this.migrate();
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
