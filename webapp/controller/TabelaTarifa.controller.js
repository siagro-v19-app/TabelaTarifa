sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("br.com.idxtecTabelaTarifa.controller.TabelaTarifa", {
		onInit: function(){
			var oParamModel = new JSONModel();
			
			this.getOwnerComponent().setModel(oParamModel, "parametros");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
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
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableTarifa").clearSelection();
		},
		
		onIncluir: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableTarifa"); 
			
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({operacao: "incluir"});
			
			oRouter.navTo("gravartarifa");
			oTable.clearSelection();
		},
		
		onEditar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableTarifa");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma tarifa na tabela.");
				return;
			}
			
			var sPath = oTable.getContextByIndex(nIndex).sPath;
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({sPath: sPath, operacao: "editar"});
			
			oRouter.navTo("gravartarifa");
			oTable.clearSelection();
		},
		
		onRemover: function(e){
			var that = this;
			var oTable = this.byId("tableTarifa");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma tarifa na tabela.");
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
		}
	});
});