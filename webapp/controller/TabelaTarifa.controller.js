sap.ui.define([
	"br/com/idxtecTabelaTarifa/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"br/com/idxtecTabelaTarifa/services/Session"
], function(BaseController, MessageBox, Filter, FilterOperator, Session) {
	"use strict";

	return BaseController.extend("br.com.idxtecTabelaTarifa.controller.TabelaTarifa", {
		onInit: function(){
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
			var oFilter = new Filter("Empresa", FilterOperator.EQ, Session.get("EMPRESA_ID"));
			var oView = this.getView();
			var oTable = oView.byId("tableTarifa");
			
			oTable.bindRows({ 
				path: '/TabelaTarifas',
				sorter: {
					path: 'Descricao'
				},
				filters: oFilter
			});
		},
		
		filtraTarifa: function(oEvent){
			var sQuery = oEvent.getParameter("query");
			var oFilter1 = new Filter("Empresa", FilterOperator.EQ, Session.get("EMPRESA_ID"));
			var oFilter2 = new Filter("Descricao", FilterOperator.Contains, sQuery);
			
			var aFilters = [
				oFilter1,
				oFilter2
			];

			this.getView().byId("tableTarifa").getBinding("rows").filter(aFilters, "Application");
		},
		
		onSearch: function(oEvent) {
			var oTable = this.getView().byId("tableTarifa");
			var oDate = this.getView().byId("vigentefilter");
			var oDesc = this.getView().byId("descricaofilter");
			var aFilters = [];
			var oFilter1, oFilter2;
			if(oDate.getDateValue() !== null){
				oFilter1 = new sap.ui.model.Filter("VigenteAte", sap.ui.model.FilterOperator.EQ, oDate.getDateValue());
				oFilter2 = new sap.ui.model.Filter("Descricao", sap.ui.model.FilterOperator.Contains, oDesc.getValue());
				aFilters.push(oFilter1, oFilter2);
			} else{
				aFilters = [];
			}
			
			oTable.getBinding("rows").filter(aFilters);
		},

		onRefresh: function(e){
			this.getModel().refresh(true);
			this.getView().byId("tableTarifa").clearSelection();
		},
		
		onIncluir: function(oEvent) {
			this.getRouter().navTo("tarifaAdd");
		},
		
		onEditar: function(oEvent) {
			var oTable = this.getView().byId("tableTarifa");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex > -1) {
				var oContext = oTable.getContextByIndex(nIndex);
				this.getRouter().navTo( "tarifaEdit" , {
					tarifa: oContext.getProperty( "Id" )
				});
				
			} else {
				MessageBox.warning("Selecione uma tarifa na tabela.");
			}
			
			oTable.clearSelection();
		},
		
		onRemover: function(e){
			var that = this;
			var oTable = this.byId("tableTarifa");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma tarifa da tabela.");
				return;
			}
			
			MessageBox.confirm("Deseja remover esta tarifa?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						that._remover(oTable, nIndex);
						MessageBox.success("Tarifa removida com sucesso!");
					}
				}
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath, {
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				}
			});
		},
		
		getModel: function(sModel) {
			return this.getOwnerComponent().getModel(sModel);
		}
	});
});