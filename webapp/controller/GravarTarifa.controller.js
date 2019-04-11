sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecTabelaTarifa/services/Session"
], function(Controller, History, MessageBox, JSONModel, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecTabelaTarifa.controller.GravarTarifa", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravartarifa").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Tarifa"
				});
			
				var oNovoTarifa = {
					"Id": 0,
					"Descricao": "",
					"TaxaArmazenagem": 0.00,
					"VencimentoArmazenagem": 0,
					"TaxaExpurgo": 0.00,
					"VencimentoExpurgo": 0,
					"Carencia": 0,
					"VigenteAte": new Date(),
					"Inativa": false,
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoTarifa);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Tarifa"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createTarifa();
			} else if (this._operacao === "editar") {
				this._updateTarifa();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("tabelatarifa", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			return oDados;
		},
		
		_createTarifa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/TabelaTarifas", this._getDados(), {
				success: function() {
					MessageBox.success("Tarifa inserida com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateTarifa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Tarifa inserida com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === "" || oView.byId("taxaarmazenagem").getValue() === ""
			|| oView.byId("vencimentoarmazenagem").getValue() === "" || oView.byId("taxaexpurgo").getValue() === ""
			|| oView.byId("vencimentoexpurgo").getValue() === "" || oView.byId("carencia").getValue() === ""
			|| oView.byId("vigenteate").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});