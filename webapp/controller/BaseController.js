sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";
	
	return Controller.extend("BaseController",{
		
		getModel: function(sModel){
			return this.getOwnerComponent().getModel(sModel);
		},
		
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		navBack : function(){
			var oRouter = this.getRouter();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("tarifaLista", {}, true);
			}
		},
		
		formChanges: function (oEvent){
			var oViewModel = this.getModel("view");
			oViewModel.setProperty("/hasChanges", true);
		},
		
		formChanged: function (){
			return 	this.getModel("view").getProperty("/hasChanges");
		}
	
	});
});