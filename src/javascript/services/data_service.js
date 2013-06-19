function DataService() {
  this.all = function () {
    var all = [];
    for (var id in localStorage) {
      if (id.match(/^inputs\.[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/))
        all.push(this.load(id));
    }
    return all;
  };

  this.load = function(id) {
    return new Inputs(id, angular.fromJson(localStorage.getItem(id)));
  };

  this.save = function(inputs) {
    localStorage.setItem(inputs.id, angular.toJson(inputs.persistentData()));
    return inputs;
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
