
function DataService(){this.onModel=function(qualifier,callback){var match,rawData,idRegexp=new RegExp("^"+qualifier+"\\.([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})$");for(var id in localStorage){match=id.match(idRegexp);if(match){rawData=localStorage.getItem(id);callback.call(this,match[1],rawData);}}};this.all=function(type){var all=[];this.onModel(type.qualifier,function(id,rawData){all.push(this.load(type,id));});return all;};this.load=function(type,id){var fqId=type.qualifyId(id);var rawData=localStorage.getItem(fqId);return new type(id,angular.fromJson(rawData));};this.save=function(obj){var fqId=obj.fqId,persistentData=obj.extractPersistentData();localStorage.setItem(fqId,angular.toJson(persistentData));return obj;};this.delete=function(obj){localStorage.removeItem(obj.fqId);}
var renameModel=function(from,to){this.onModel(from,function(id,rawData){localStorage.setItem(to+"."+id,rawData);localStorage.removeItem(from+"."+id);});};var migrations={null:function(){var data;for(var name in localStorage){data=angular.fromJson(localStorage.getItem(name));data.name=name;localStorage.setItem("inputs."+uuid(),angular.toJson(data));localStorage.removeItem(name);}
return"1";},1:function(){renameModel.call(this,"inputs","cost");return"2";},2:function(){var data,costData,paymentData;this.onModel("cost",function(id,rawData){data=angular.fromJson(rawData);costData={};paymentData={};for(var key in data){if(["capital","interestRate","amortizationRate"].indexOf(key)==-1){costData[key]=data[key];}else{paymentData[key]=data[key];}}
paymentData.name=data.name;localStorage.setItem("cost."+id,angular.toJson(costData));localStorage.setItem("payment."+uuid(),angular.toJson(paymentData));});return"3";},3:function(){renameModel.call(this,"cost","purchase");return"4";},4:function(){renameModel.call(this,"payment","financing");return"5";}};this.migrate=function(){var schemaVersion=localStorage.getItem("schemaVersion"),migration,newSchemaVersion;do{migration=migrations[schemaVersion];if(migration===undefined){break;}
newSchemaVersion=migration.call(this);console.log("migrated schema from version "+schemaVersion+" to version "+newSchemaVersion);schemaVersion=newSchemaVersion;}while(true);if(schemaVersion)
localStorage.setItem("schemaVersion",schemaVersion);};this.migrate();}
function makePersistable(modelClass,defaults){modelClass.qualifier=modelClass.name.toLowerCase();modelClass.qualifyId=function(id){return modelClass.qualifier+"."+id;};modelClass.prototype.initialize=function(id,persistentData){this.id=id||uuid();this.fqId=modelClass.qualifyId(this.id);angular.extend(this,defaults);angular.extend(this,persistentData);};modelClass.prototype.extractPersistentData=function(){persistentData={};for(key in defaults){persistentData[key]=this[key];}
return persistentData;}}
function SelectionService(type){return function(dataService){this.sort=function(){this.all.sort(function(a,b){if(a.name<b.name){return-1;}else if(a.name>b.name){return 1}else{return(a.id<b.id)?-1:1}});}
this.add=function(obj){dataService.save(obj);this.all.push(obj);this.sort();this.select(obj);};this.addNew=function(){this.add(new type());};this.select=function(obj){if(obj==null||this.all.indexOf(obj)!=-1){this.selected=obj;}
return this.selected;}
this.saveSelected=function(){if(this.selected){dataService.save(this.selected);this.sort();}};this.delete=function(obj){if(confirm("Löschen?")){var index=this.all.indexOf(obj);if(index!=-1){dataService.delete(obj);this.all.splice(index,1);if(obj==this.selected){this.select(null);}}}};this.duplicate=function(obj){var data=obj.extractPersistentData();data.name="Copy of "+data.name;this.add(new type(null,data));}
this.selected=null;this.all=dataService.all(type);this.sort();}}
function Financing(id,persistentData){this.initialize(id,persistentData);}
Financing.prototype.paymentRate=function(){return this.interestRate+this.amortizationRate;};makePersistable(Financing,{name:"",capital:0.0,interestRate:3.0,amortizationRate:1.0,optionalAmortizationRate:5.0,});function Payment(date,amount,previousBalance,interestRate){this.date=date;this.amount=amount;this.previousBalance=previousBalance;this.interestRate=interestRate;this.interest=Math.round(this.previousBalance*this.interestRate/12*100)/100.0;this.amortization=Math.min(this.amount-this.interest,this.previousBalance);this.payment=this.interest+this.amortization;this.newBalance=this.previousBalance-this.amortization;}
function Purchase(id,persistentData){this.initialize(id,persistentData);}
Purchase.prototype.taxCost=function(){return this.price*this.tax/100.0;};Purchase.prototype.notaryCost=function(){return this.price*this.notary/100.0;};Purchase.prototype.brokerageCost=function(){return this.price*this.brokerage/100.0;};Purchase.prototype.totalCost=function(){return this.price+this.addOns+this.taxCost()+this.notaryCost()+this.brokerageCost();};Purchase.prototype.firstPaymentAt=function(){var timestamp=Date.parse(this.purchaseDate);var date=isNaN(timestamp)?new Date():new Date(timestamp);return new Date(date.getFullYear(),date.getMonth(),1);}
makePersistable(Purchase,{name:"",price:0.0,addOns:0.0,tax:5.0,notary:1.5,brokerage:6.25,purchaseDate:"",});function InterestCtrl($scope,$timeout,purchaseSelectionService,financingSelectionService){$scope.purchases=purchaseSelectionService;$scope.financings=financingSelectionService;$scope.credit=function(){if($scope.purchases.selected&&$scope.financings.selected){return $scope.purchases.selected.totalCost()-$scope.financings.selected.capital;}};$scope.monthlyPayment=function(){if($scope.financings.selected){var yearlyPayment=$scope.credit()*$scope.financings.selected.paymentRate()/100.0;return Math.round(yearlyPayment/12);}};$scope.optionalYearlyPayment=function(){if($scope.financings.selected){return $scope.credit()*$scope.financings.selected.optionalAmortizationRate/100.0;}};$scope.adjustInterestAmortization=function(amount){var financing=$scope.financings.selected;financing.interestRate=round(financing.interestRate+amount);financing.amortizationRate=round(financing.amortizationRate-amount);$scope.calculate();};var calculationTimer,processData;$scope.calculate=function(){if($scope.purchases.selected&&$scope.financings.selected){$timeout.cancel(calculationTimer);$scope.purchases.saveSelected();$scope.financings.saveSelected();$scope.payments=null;$scope.processing=true;processData={payments:[],payment:null,date:$scope.purchases.selected.firstPaymentAt(),balance:$scope.credit(),};calculationTimer=$timeout(calculateNextPayment,100);}};function calculateNextPayment(times){times=times||0;if(processData.balance>0){var amount=$scope.monthlyPayment();if(processData.date.getMonth()==11){amount+=$scope.optionalYearlyPayment();}
var payment=new Payment(processData.date,amount,processData.balance,$scope.financings.selected.interestRate/100.0);processData.date=new Date(payment.date.getFullYear(),payment.date.getMonth()+1,1);processData.balance=payment.newBalance;processData.payments.push(payment);if(times<6){calculateNextPayment(times+1);}else{calculationTimer=$timeout(calculateNextPayment,0);}}else{$scope.totalInterest=0;$scope.totalPayments=0;for(var payment in processData.payments){$scope.totalInterest+=processData.payments[payment].interest;$scope.totalPayments+=processData.payments[payment].payment;};$scope.payments=processData.payments;$scope.processing=false;processData=null;}}
function round(float){return Math.round(parseFloat(float)*Math.pow(10,2))/Math.pow(10,2);}}
var app=angular.module("app",[]);app.service("dataService",DataService);app.service("purchaseSelectionService",SelectionService(Purchase));app.service("financingSelectionService",SelectionService(Financing));app.controller("interestCtrl",InterestCtrl);app.filter("percent",function(){return function(data){return data+" %";};});function uuid(){var s4=function(){return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);};return s4()+s4()+'-'+s4()+'-'+s4()+'-'+
s4()+'-'+s4()+s4()+s4();}