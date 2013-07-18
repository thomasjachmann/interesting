function SelectionService(type) {
  return function(dataService) {
    this.sort = function() {
      this.all.sort(function(a, b) {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1
        } else {
          return (a.id < b.id) ? -1 : 1
        }
      });
    }

    this.add = function(obj) {
      dataService.save(obj);
      this.all.push(obj);
      this.sort();
      this.select(obj);
    };

    this.addNew = function() {
      this.add(new type());
    };

    this.select = function(obj) {
      if (obj == null || this.all.indexOf(obj) != -1) {
        this.selected = obj;
      }
      return this.selected;
    }

    this.saveSelected = function() {
      if (this.selected) {
        dataService.save(this.selected);
        this.sort();
      }
    };

    this.delete = function(obj) {
      if (confirm("Löschen?")) {
        var index = this.all.indexOf(obj);
        if (index != -1) {
          dataService.delete(obj);
          this.all.splice(index, 1);
          if (obj == this.selected) {
            this.select(null);
          }
        }
      }
    };

    this.duplicate = function(obj) {
      var data = obj.extractPersistentData();
      data.name = "Copy of " + data.name;
      this.add(new type(null, data));
    }

    this.selected = null;
    this.all = dataService.all(type);
    this.sort();
  }
}
