function DataService() {

  this.onModel = function(qualifier, callback) {
    var match, rawData,
        idRegexp = new RegExp("^" + qualifier + "\\.([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})$");
    for (var id in localStorage) {
      match = id.match(idRegexp);
      if (match) {
        rawData = localStorage.getItem(id);
        callback.call(this, match[1], rawData);
      }
    }
  };

  this.all = function (type) {
    var all = [];
    this.onModel(type.qualifier, function(id, rawData) {
      all.push(this.load(type, id));
    });
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
    var fqId = type.qualifyId(id);
    var rawData = localStorage.getItem(fqId);
    return new type(id, angular.fromJson(rawData));
  };

  this.save = function(obj) {
    var fqId = obj.fqId,
        persistentData = obj.extractPersistentData();
    localStorage.setItem(fqId, angular.toJson(persistentData));
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
      onModel("inputs", function(id, rawData) {
        localStorage.setItem("cost." + id, rawData);
        localStorage.removeItem("inputs." + id);
      });
      return "2";
    },
    2: function () {
      var data, costData, paymentData;
      onModel("cost", function(id, rawData) {
        data = angular.fromJson(rawData);
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
        localStorage.setItem("cost." + id, angular.toJson(costData));
        localStorage.setItem("payment." + uuid(), angular.toJson(paymentData));
      });
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

function makePersistable(modelClass, defaults) {
  modelClass.qualifier = modelClass.name.toLowerCase();
  modelClass.qualifyId = function(id) {
    return modelClass.qualifier + "." + id;
  };

  modelClass.prototype.initialize = function(id, persistentData) {
    this.id = id || uuid();
    this.fqId = modelClass.qualifyId(this.id);
    angular.extend(this, defaults);
    angular.extend(this, persistentData);
  };

  modelClass.prototype.extractPersistentData = function() {
    persistentData = {};
    for (key in defaults) {
      persistentData[key] = this[key];
    }
    return persistentData;
  }
}
