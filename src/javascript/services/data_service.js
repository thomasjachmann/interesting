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

  this.delete = function(obj) {
    localStorage.removeItem(obj.fqId);
  }

  var renameModel = function(from, to) {
    this.onModel(from, function(id, rawData) {
      localStorage.setItem(to + "." + id, rawData);
      localStorage.removeItem(from + "." + id);
    });
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
      renameModel.call(this, "inputs", "cost");
      return "2";
    },
    2: function () {
      var data, costData, paymentData;
      this.onModel("cost", function(id, rawData) {
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
    },
    3: function() {
      renameModel.call(this, "cost", "purchase");
      return "4";
    },
    4: function() {
      renameModel.call(this, "payment", "financing");
      return "5";
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
      newSchemaVersion = migration.call(this);
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
