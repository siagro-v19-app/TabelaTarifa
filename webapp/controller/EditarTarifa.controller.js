sap.ui.define([
	"br/com/idxtecTabelaTarifa/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"br/com/idxtecTabelaTarifa/services/Session"
], function( BaseController , MessageBox , JSONModel , History , Session) {
	"use strict";

	return BaseController.extend("br.com.idxtecTabelaTarifa.controller.EditarTarifa", {
		onInit: function(){
			var that = this;
			var oView = this.getView();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute( "tarifaEdit" ).attachMatched( this._routerMatch , this );
			
			oView.addStyleClass( this.getOwnerComponent().getContentDensityClass() );
			
			var oModel = this.getModel();
			oModel.attachBatchRequestCompleted(function (){
				
				that.showFormFragment( "TarifaCampos" ).then(function (){
					oView.setBusy( false ); 
				}); 
			});
		},
		
		onBeforeRendering: function(){
			var oModel = this.getModel();
			var oView = this.getView();
			
			oView.setBusyIndicatorDelay(0);
			oModel.attachBatchRequestSent( function(){
				oView.setBusy( true ); 
			} );
		},
		
		getModel : function( sModel ) {
			return this.getOwnerComponent().getModel( sModel );	
		},
		
		_routerMatch: function(oEvent) {
			var oViewModel = this.getModel("view");
			
			oViewModel.setProperty("/titulo", "Editar Tarifa");
			
			var sTarifa = oEvent.getParameter("arguments").tarifa;
			var iTarifaId = parseInt(sTarifa, 0);
			
			var oTarifaModel = new JSONModel();
			var oCustoModel = new JSONModel();
			var oQuebraModel = new JSONModel();
			var oModel = this.getModel();
			
			var sPathTarifa = "/TabelaTarifas(" + iTarifaId + ")";
			var sPathCusto = "/TabelaTarifaSecagemCustos";
			var sPathQuebra = "/TabelaTarifaSecagemQuebras";
			
			oModel.read(sPathTarifa, {
				success: function(oTarifa){
					oTarifaModel.setData(oTarifa);
				}
			});
			
			oModel.read(sPathCusto,{
				filters: [
					new sap.ui.model.Filter({
						path: 'TabelaTarifa',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sTarifa
					})
				],
			
				success: function(oData) {
					oCustoModel.setData(oData.results);
				}
				
			});
			
			oModel.read(sPathQuebra,{
				filters: [
					new sap.ui.model.Filter({
						path: 'TabelaTarifa',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sTarifa
					})
				],
			
				success: function(oData) {
					oQuebraModel.setData(oData.results);
				}
				
			});

			this.getView().setModel(oTarifaModel, "tarifa");
			this.getView().setModel(oCustoModel, "custo");
			this.getView().setModel(oQuebraModel, "quebra");
		},
		
		onInserirCusto: function(oEvent) {
			var oTarifaModel = this.getView().getModel("tarifa");
			var oCustoModel = this.getView().getModel("custo");
			var oItems = oCustoModel.getProperty("/");

			var iTarifaId = oTarifaModel.getProperty("/Id");
			var iEmpresaId = Session.get("EMPRESA_ID");
			var iUsuarioId = Session.get("USUARIO_ID");

			var sPathTarifa = "/TabelaTarifas(" + iTarifaId + ")";
			var sPathEmpresas = "/Empresas(" + iEmpresaId + ")";
			var sPathUsuarios = "/Usuarios(" + iUsuarioId + ")";

			var oNovoCusto = oItems.concat({
				Id: 0,
	    		CustoSecagem: 0.00,
				UmidadeDe: 0.00,
				UmidadeAte: 0.00,
				TabelaTarifa: iTarifaId,
				TabelaTarifaDetails: { __metadata: { uri: sPathTarifa } },
				Empresa: iEmpresaId,
				EmpresaDetails: { __metadata: { uri: sPathEmpresas } },
				Usuario: iUsuarioId,
				UsuarioDetails: { __metadata: { uri: sPathUsuarios } }
	    	});
			
			this.getView().getModel("custo").setProperty("/", oNovoCusto);
		},
		
		onRemoverCusto: function(oEvent){
			var oCustoModel = this.getView().getModel("custo");
			
			var oTable = this.getView().byId("tableSecagemCusto");

			var nIndex = oTable.getSelectedIndex();
			var oModel = this.getModel();
			
			if (nIndex > -1) {
				var oContext = oTable.getContextByIndex(nIndex);
				var oDados = oContext.getObject();
				var oItems = oCustoModel.getProperty("/");
				
				if (oDados.Id !== 0) {
					oModel.remove(`/TabelaTarifaSecagemCustos(${oDados.Id})`, {
						groupId: "upd"
					});
				}
				
				oItems.splice(nIndex,1);
				oCustoModel.setProperty("/", oItems);
				oTable.clearSelection();
			} else {
				sap.m.MessageBox.warning("Selecione um item na tabela!");
			}
		},
		
		onInserirQuebra: function(oEvent) {
			var oTarifaModel = this.getView().getModel("tarifa");
			var oQuebraModel = this.getView().getModel("quebra");
			var oItems = oQuebraModel.getProperty("/");

			var iTarifaId = oTarifaModel.getProperty("/Id");
			var iEmpresaId = Session.get("EMPRESA_ID");
			var iUsuarioId = Session.get("USUARIO_ID");

			var sPathTarifa = "/TabelaTarifas(" + iTarifaId + ")";
			var sPathEmpresas = "/Empresas(" + iEmpresaId + ")";
			var sPathUsuarios = "/Usuarios(" + iUsuarioId + ")";

			var oNovoQuebra = oItems.concat({
				Id: 0,
	    		CustoSecagem: 0.00,
				UmidadeDe: 0.00,
				UmidadeAte: 0.00,
				TabelaTarifa: iTarifaId,
				TabelaTarifaDetails: { __metadata: { uri: sPathTarifa } },
				Empresa: iEmpresaId,
				EmpresaDetails: { __metadata: { uri: sPathEmpresas } },
				Usuario: iUsuarioId,
				UsuarioDetails: { __metadata: { uri: sPathUsuarios } }
	    	});
			
			this.getView().getModel("quebra").setProperty("/", oNovoQuebra);
		},
		
		onRemoverQuebra: function(oEvent){
			var oQuebraModel = this.getView().getModel("quebra");
			
			var oTable = this.getView().byId("tableSecagemQuebra");

			var nIndex = oTable.getSelectedIndex();
			var oModel = this.getModel();
			
			if (nIndex > -1) {
				var oContext = oTable.getContextByIndex(nIndex);
				var oDados = oContext.getObject();
				var oItems = oQuebraModel.getProperty("/");
				
				if (oDados.Id !== 0) {
					oModel.remove(`/TabelaTarifaSecagemQuebras(${oDados.Id})`, {
						groupId: "upd"
					});
				}
				
				oItems.splice(nIndex,1);
				oQuebraModel.setProperty("/", oItems);
				oTable.clearSelection();
			} else {
				sap.m.MessageBox.warning("Selecione um item na tabela!");
			}
		},
		
		onSalvar: function() {
			var that = this;
			var soma = 0;
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
			
			var iTarifaId = oDadosTarifa.Id;

			var sPathTarifa = "/TabelaTarifas(" + iTarifaId + ")";
			
			var sTaxaArmazenagem = oDadosTarifa.TaxaArmazenagem;
			var sTaxaExpurgo = oDadosTarifa.TaxaExpurgo;
			
			var fTaxaArmazenagem = parseFloat( sTaxaArmazenagem );
			var fTaxaExpurgo = parseFloat( sTaxaExpurgo );
			
			oDadosTarifa.TaxaArmazenagem = fTaxaArmazenagem;
			oDadosTarifa.TaxaExpurgo = fTaxaExpurgo;
			
			oModel.setDeferredGroups(["upd"]);

			var mParameters = { groupId: "upd" };
			oModel.update(sPathTarifa, oDadosTarifa, mParameters);
			
			for (var i = 0; i < oDadosCusto.length; i++) {
				
				var iItemId = oDadosCusto[i].Id;
				var iTarifaId = oDadosCusto[i].TabelaTarifa;

				var sTarifaPath = "/TabelaTarifas(" + iTarifaId + ")";
				var sPathCusto = "/TabelaTarifaSecagemCustos";
				
				var sCustoSecagem = oDadosCusto[i].CustoSecagem;
				var sUmidadeAte = oDadosCusto[i].UmidadeAte;
				var sUmidadeDe = oDadosCusto[i].UmidadeDe;
				
				var fCustoSecagem = parseFloat( sCustoSecagem );
				var fUmidadeAte = parseFloat( sUmidadeAte );
				var fUmidadeDe = parseFloat( sUmidadeDe );
				
				oDadosCusto[i].CustoSecagem = fCustoSecagem;
				oDadosCusto[i].UmidadeAte = fUmidadeAte;
				oDadosCusto[i].UmidadeDe = fUmidadeDe;
				
				if (iItemId === 0){
					oModel.create(sPathCusto, oDadosCusto[i], mParameters);
				} else {
					sPathCusto = "/TabelaTarifaSecagemCustos(" + iItemId + ")";
					oModel.update(sPathCusto, oDadosCusto[i], mParameters);
				}
			}
			
			for (var i = 0; i < oDadosQuebra.length; i++) {
				
				var iItemId = oDadosQuebra[i].Id;
				var iTarifaId = oDadosQuebra[i].TabelaTarifa;
				
				var sQuebraSecagem = oDadosQuebra[i].QuebraSecagem;
				var sUmidadeAte = oDadosQuebra[i].UmidadeAte;
				var sUmidadeDe = oDadosQuebra[i].UmidadeDe;
				
				var fQuebraSecagem = parseFloat( sQuebraSecagem );
				var fUmidadeAte = parseFloat( sUmidadeAte );
				var fUmidadeDe = parseFloat( sUmidadeDe );
				
				oDadosQuebra[i].QuebraSecagem = fQuebraSecagem;
				oDadosQuebra[i].UmidadeAte = fUmidadeAte;
				oDadosQuebra[i].UmidadeDe = fUmidadeDe;

				var sTarifaPath = "/TabelaTarifas(" + iTarifaId + ")";
				var sPathQuebra = "/TabelaTarifaSecagemQuebras";

				if (iItemId === 0){
					oModel.create(sPathQuebra, oDadosQuebra[i], mParameters);
				} else {
					sPathQuebra = "/TabelaTarifaSecagemQuebras(" + iItemId + ")";
					oModel.update(sPathQuebra, oDadosQuebra[i], mParameters);
				}
			}

			oModel.submitChanges({
				groupId: "upd",
				success: function(oResponse) {
					//se a propriedade response não for undefined, temos erro de gravação
					var erro = oResponse.__batchResponses[0].response;
					if (!erro) {
						sap.m.MessageBox.success("Tabela Tarifa alterada com sucesso!",{
							onClose: function() {
								that.navBack();
							}
						});
					}
				}
			});
		},
		
		_getFormFragment: function (sFragmentName) {
			if (this._formFragment) {
				return this._formFragment;
			}
		
			this._formFragment = sap.ui.xmlfragment(this.getView().getId(),`br.com.idxtecTabelaTarifa.view.${sFragmentName}`, this);

			return this._formFragment;
		},

		showFormFragment : function (sFragmentName) {
			var that = this;
			return new Promise(function (resolve){
				var oPage = that.getView().byId("pageTarifaEdit");
				oPage.removeAllContent();
				oPage.insertContent(that._getFormFragment(sFragmentName), 0);
				resolve();
			});
		},
		
		onVoltar: function (oEvent) {
			var oViewModel = this.getModel("view");
			var that = this;

			if(this.formChanged()){
				sap.m.MessageBox.confirm("Todas as informações serão descartadas, deseja continuar?", {
					onClose: function(sResposta){
						if(sResposta === "OK"){
							oViewModel.setProperty("/hasChanges", false);
							that.navBack();
						}
					}
				});
			} else{
				this.navBack();
			}
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
	});

});