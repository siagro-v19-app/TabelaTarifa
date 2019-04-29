sap.ui.define([
	"br/com/idxtecTabelaTarifa/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecTabelaTarifa/services/Session"
], function( BaseController, History, MessageBox, JSONModel, Session ) {
	"use strict";

	return BaseController.extend("br.com.idxtecTabelaTarifa.controller.GravarTarifa", {
		onInit: function(){
			var oView = this.getView();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute( "tarifaAdd" ).attachMatched( this._routerMatch , this );
			
			oView.addStyleClass( this.getOwnerComponent().getContentDensityClass() );
    	
			this.showFormFragment( "TarifaCampos" );
			
			this._blockTab();
		},
		
		_blockTab: function(){
			var oTabContainer = this.getView().byId("tabTarifa");
	    	
	    	oTabContainer.addEventDelegate({
	        	onAfterRendering: function() {
					var oTabStrip = this.getAggregation("_tabStrip");
					var oItems = oTabStrip.getItems();
					for (var i = 0; i < oItems.length; i++) {
						var oCloseButton = oItems[i].getAggregation("_closeButton");
						oCloseButton.setVisible(false);
					}
	        	}
	    	}, oTabContainer);
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		},
		
		_routerMatch: function(){
			var oViewModel = this.getModel("view");
			
			oViewModel.setProperty("/titulo", "Inserir Nova Tarifa");
			
			var oTarifaModel = new JSONModel();
			var oCustoModel = new JSONModel();
			var oQuebraModel = new JSONModel();
			
			var iEmpresaId = Session.get("EMPRESA_ID");
			var iUsuarioId = Session.get("USUARIO_ID");
			
			var sPathEmpresas = "/Empresas(" + iEmpresaId + ")";
			var sPathUsuarios = "/Usuarios(" + iUsuarioId + ")";
			
			var oNovoTarifa = {
				Id: 0,
				Descricao: "",
				TaxaArmazenagem: 0.00,
				VencimentoArmazenagem: 0,
				TaxaExpurgo: 0.00,
				VencimentoExpurgo: 0,
				Carencia: 0,
				VigenteAte: new Date(),
				Inativa: false,
				Empresa: iEmpresaId,
				Usuario: iUsuarioId,
				EmpresaDetails: { __metadata: { uri: sPathEmpresas } },
				UsuarioDetails: { __metadata: { uri: sPathUsuarios } }
			};
			
				
			oTarifaModel.setData(oNovoTarifa);
			oCustoModel.setData([]);
			oQuebraModel.setData([]);
			
			this.getView().setModel(oTarifaModel,"tarifa");
			this.getView().setModel(oCustoModel,"custo");
			this.getView().setModel(oQuebraModel,"quebra");
		},
		
		onInserirCusto: function(oEvent) {
			var oCustoModel = this.getView().getModel("custo");
			
			var iEmpresaId = Session.get("EMPRESA_ID");
			var iUsuarioId = Session.get("USUARIO_ID");
			
			var sPathEmpresas = "/Empresas(" + iEmpresaId + ")";
			var sPathUsuarios = "/Usuarios(" + iUsuarioId + ")";
			
			var oItems = oCustoModel.getProperty("/");
			
			var oNovoCusto = oItems.concat({
				Id: 0,
	    		CustoSecagem: 0.00,
				UmidadeDe: 0.00,
				UmidadeAte: 0.00,
				Empresa: iEmpresaId,
				Usuario: iUsuarioId,
				EmpresaDetails: { __metadata: { uri: sPathEmpresas } },
				UsuarioDetails: { __metadata: { uri: sPathUsuarios } }
	    	});
				
			this.getView().getModel("custo").setProperty("/", oNovoCusto);
		},
		
		onRemoverCusto: function(oEvent){
			var oCustoModel = this.getView().getModel("custo");
			
			var oTable = this.getView().byId("tableSecagemCusto");
			
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex > -1) {
				var oItems = oCustoModel.getProperty("/");
				
				oItems.splice(nIndex, 1);
				oCustoModel.setProperty("/", oItems);
				oTable.clearSelection();
			} else {
				sap.m.MessageBox.warning("Selecione um item na tabela!");
			}
		},
		
		onInserirQuebra: function(){
			var oQuebraModel = this.getView().getModel("quebra");
			
			var iEmpresaId = Session.get("EMPRESA_ID");
			var iUsuarioId = Session.get("USUARIO_ID");
			
			var sPathEmpresas = "/Empresas(" + iEmpresaId + ")";
			var sPathUsuarios = "/Usuarios(" + iUsuarioId + ")";
			
			var oItems = oQuebraModel.getProperty("/");
			
			var oNovoQuebra = oItems.concat({
				Id: 0,
	    		QuebraSecagem: 0.00,
				UmidadeDe: 0.00,
				UmidadeAte: 0.00,
				Empresa: iEmpresaId,
				Usuario: iUsuarioId,
				EmpresaDetails: { __metadata: { uri: sPathEmpresas } },
				UsuarioDetails: { __metadata: { uri: sPathUsuarios } }
	    	});
			
			this.getView().getModel("quebra").setProperty("/", oNovoQuebra);
		},
		
		onRemoverQuebra: function(oEvent){
			var oCustoModel = this.getView().getModel("quebra");
			
			var oTable = this.getView().byId("tableSecagemQuebra");
			
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex > -1) {
				var oItems = oCustoModel.getProperty("/");
				
				oItems.splice(nIndex, 1);
				oCustoModel.setProperty("/", oItems);
				oTable.clearSelection();
			} else {
				sap.m.MessageBox.warning("Selecione um item na tabela!");
			}
		},
		
		onSalvar: function() {
			var that = this;
			var oTarifaModel = this.getView().getModel("tarifa");
			var oCustoModel = this.getView().getModel("custo");
			var oQuebraModel = this.getView().getModel("quebra");
			var oModel = this.getModel();
			
			var oDadosTarifa = oTarifaModel.getData();
			var oDadosCusto = oCustoModel.getData();
			var oDadosQuebra = oQuebraModel.getData();
			
			if(this._verificaCabecalho(this.getView())){
				return;
			}

			if(this._verificaLinhasCusto( oDadosCusto )){
				return;
			}
			
			if(this._verificaLinhasQuebra ( oDadosQuebra )){
				return;
			}

			oModel.create("/TabelaTarifas", this._getDados(oDadosTarifa, oDadosCusto, oDadosQuebra), {
				success: function(){
					sap.m.MessageBox.success("Tarifa inserida com sucesso!",{
						onClose: function() {
							that.navBack();
						}
					});
				}
			});
		},
		
		_getDados: function( oDadosTarifa, oDadosCusto, oDadosQuebra ){
			oDadosTarifa.TabelaTarifaSecagemCustoDetails = [];
			oDadosTarifa.TabelaTarifaSecagemQuebraDetails = [];
		
			for ( var i = 0; i < oDadosCusto.length; i++) {
				oDadosTarifa.TabelaTarifaSecagemCustoDetails.push(oDadosCusto[i]);
			}
			
			for ( var i = 0; i < oDadosQuebra.length; i++) {
				oDadosTarifa.TabelaTarifaSecagemQuebraDetails.push(oDadosQuebra[i]);
			}
			
			return oDadosTarifa;
		},
		
		_getFormFragment: function (sFragmentName) {
			if (this._formFragment) {
				return this._formFragment;
			}
		
			this._formFragment = sap.ui.xmlfragment(this.getView().getId(),`br.com.idxtecTabelaTarifa.view.${sFragmentName}`, this);

			return this._formFragment;
		},

		showFormFragment : function (sFragmentName) {
			var oPage = this.getView().byId("pageTarifaAdd");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		
		_verificaCabecalho: function( oView ){
			if(oView.byId("descricao").getValue() === "" || oView.byId("taxaarmazenagem").getValue() === ""
			|| oView.byId("vencimentoarmazenagem").getValue() === "" || oView.byId("taxaexpurgo").getValue() === ""
			|| oView.byId("vencimentoexpurgo").getValue() === "" || oView.byId("carencia").getValue() === ""
			|| oView.byId("vigenteate").getValue() === ""){
				MessageBox.warning("Preencha todos os campos!");
				return true;
			} 
		},
		
		_verificaLinhasCusto : function( oDadosCusto ){
			debugger;
				for( var i=0; i<oDadosCusto.length; i++ ){
					if(oDadosCusto[i].CustoSecagem === null || oDadosCusto[i].UmidadeDe === null
					|| oDadosCusto[i].UmidadeAte === null){
						MessageBox.warning("Preencha todos os campos de custo!");
						return true;
					}
					if(oDadosCusto[i].CustoSecagem === 0.00 || oDadosCusto[i].UmidadeDe === 0.00
						|| oDadosCusto[i].UmidadeAte === 0.00){
						MessageBox.warning("Os dados de custo não podem ter valor igual a 0 (zero).");
						return true;
					}
				}
		},
		
		_verificaLinhasQuebra : function( oDadosQuebra ){
			if(oDadosQuebra.length > -1){
				for( var i=0; i<oDadosQuebra.length; i++ ){
					if(oDadosQuebra[i].CustoSecagem === null || oDadosQuebra[i].UmidadeDe === null
					|| oDadosQuebra[i].UmidadeAte === null){
						MessageBox.warning("Preencha todos os campos de quebra!");
						return true;
					}
					if(oDadosQuebra[i].CustoSecagem === 0.00 || oDadosQuebra[i].UmidadeDe === 0.00
					|| oDadosQuebra[i].UmidadeAte === 0.00){
						MessageBox.warning("Os dados de quebra não podem ter valor igual a 0 (zero).");
						return true;
					}
				}	
			}
		},
		
		onVoltar: function(){
			var oViewModel = this.getModel("view");
			var that = this; 
			if(this.formChanged()){
				MessageBox.confirm("Todas as informações serão descartadas, deseja continuar?", {
					onClose: function(sResponse){
						if(sResponse === "OK"){
							oViewModel.setProperty("/hasChanges", false);
							that.navBack();
						}
					}
				})
			} else {
				this.navBack();
			}
		}
	});

});