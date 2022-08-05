sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.chappota.wippoc2.wipproject2.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */
        onInit: function () { // sap.ui.core.BusyIndicator.hide();
            this.selflag = 0;
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("object").attachPatternMatched(this._getwipprojectdata, this);


        },
        // onCheckBoxSelect: function (oEvent) {
        // var bFixedLayout = oEvent.getParameter("selected");
        // var oTable = oEvent.getSource().getParent().getParent();
        // oTable.setFixedLayout(bFixedLayout);
        // },
        _refresh: function () {
            var jsonarray = [];
			// var finalarray = [];

			var owndata = {
				AccountingDocument: "",
                ReferenceDocument: "",
                WBSElement: "",
                AmountInGlobalCurrency: "",
                DocumentItemText: ""
				
			};
			jsonarray.push(owndata);
            var jsonmodel = new JSONModel();
			jsonmodel.setData(jsonarray);
			this.getView().byId("wiptable").setModel(jsonmodel, "wipentry");
            
        },
        _refreshWipTable : function(){
            this.byId("suggestionhelpbox").setValue();
            var oTable = this.byId("wiptable");
            oTable.setBusy(true);
            
            const pid = this.pid,
                jrnlentrymdl = this.getOwnerComponent().getModel("jrnlentryMDL"),
                wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL"),

                projectfilter = new Filter("Project", FilterOperator.EQ, pid);

            const wipprojlist = this.getOwnerComponent().getModel(),
                engagementProjectFilter = new Filter("EngagementProject", FilterOperator.EQ, pid);
            wipprojlist.read("/YY1_WIPProjectListAPI1", {
                filters: [engagementProjectFilter],
                success: (odata) => {

                    var wipprojjson = new JSONModel();
                    wipprojjson.setData(odata.results[0]);
                    this.getView().setModel(wipprojjson, "prjlst");
                },
                error: (err) => {
                    MessageToast.show(err);
                    //busyDialog.close();
                }
            });
            jrnlentrymdl.read("/YY1_JournalEntryItem", {
                filters: [projectfilter],
                success: function (odata) {


                    
                   
                    var jsonmodelmainjrnlentry = new JSONModel();
                    jsonmodelmainjrnlentry.setData(odata.results);


                    // Read 2nd API wipedits
                    // var wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL");
                    wipeditsmdl.read("/YY1_WIPEDITS", {
                        success: function (odata2) {
                            oTable.setBusy(false);
                            var jsonmodelwipedit = new JSONModel();
                           
                            jsonmodelwipedit.setData(odata2.results);
                            debugger;
                            var changedflag = 0, newFlag = 0, updateflag =0;

                            for (var i = 0; i < odata.results.length; i++) {
                                for (var j = 0; j < odata2.results.length; j++) {
                                    if (odata.results[i].AccountingDocument === jsonmodelwipedit.oData[j].JEID) {
                                        
                                        odata.results[i].Status = "Updated";
                                        odata.results[i].StatusObject = "Error";
                                        odata.results[i].StatusIcon = 'sap-icon://edit';
                                        changedflag++;
                                        updateflag++;
                                        if(updateflag === 1){
                                            this.i = i;
                                        }
                                    }

                                }

                            }

                            for (var j = 0; j < odata2.results.length; j++) {
                                if (jsonmodelwipedit.oData[j].Status === "01" &  odata.results[0].Project === jsonmodelwipedit.oData[j].ProjectID) {
                                    odata.results[odata.results.length] = {}
                                    odata.results[odata.results.length - 1].AccountingDocument = jsonmodelwipedit.oData[j].JEID,
                                    odata.results[odata.results.length - 1].Project = jsonmodelwipedit.oData[j].ProjectID,
                                    odata.results[odata.results.length - 1].DocumentItemText = jsonmodelwipedit.oData[j].Notes,
                                    odata.results[odata.results.length - 1].WBSElement = jsonmodelwipedit.oData[j].WBS,
                                    odata.results[odata.results.length - 1].Quantity = jsonmodelwipedit.oData[j].Quantity
                                    odata.results[odata.results.length - 1].Status = "New";
                                    odata.results[odata.results.length - 1].StatusObject = "Information";
                                    odata.results[odata.results.length - 1].StatusIcon = 'sap-icon://notes';
                                    newFlag++;
                                }
                                if (jsonmodelwipedit.oData[j].Status === "02" 
                                &  odata.results[0].Project === jsonmodelwipedit.oData[j].ProjectID
                                    & this.accdocjeid === jsonmodelwipedit.oData[j].JEID
                                    ) {
                                        odata.results[this.i] = {}
                                        odata.results[this.i].AccountingDocument = jsonmodelwipedit.oData[j].JEID,
                                        odata.results[this.i].Project = jsonmodelwipedit.oData[j].ProjectID,                                  
                                        odata.results[this.i].Quantity = jsonmodelwipedit.oData[j].Quantity,
                                        odata.results[this.i].WBSElement = jsonmodelwipedit.oData[j].WBS,
                                       // odata.results[this.i].Quantity = jsonmodelwipedit.oData[j].Quantity,
                                        odata.results[this.i].DocumentItemText = jsonmodelwipedit.oData[j].Notes
                                        odata.results[this.i].Status = "New";
                                        odata.results[this.i].StatusObject = "Information";
                                        odata.results[this.i].StatusIcon = 'sap-icon://notes';

                        }

                            }
                  

                            var changedjson = new JSONModel();
                            changedjson.setData(changedflag);
                            this.getView().setModel(changedjson, "changedcount");

                            var newcount = newFlag;
                            var newjson = new JSONModel();
                            newjson.setData(newcount);
                            this.getView().setModel(newjson, "newcount");

                            var orignal = odata.results.length- newcount - changedflag;
                            var orignaljson = new JSONModel();
                            orignaljson.setData(orignal);
                            this.getView().setModel(orignaljson, "orignal");

                            var count = new JSONModel();
                            count.setData(odata.results.length);
                            this.getView().setModel(count, "count1"); 

                            this.getView().byId("wiptable").setModel(jsonmodelmainjrnlentry, "wipentry");
                            //busyDialog.close();
                            // this.getView().byId("wiptable").setModel(jsonmodelwipedit, "wipentry");
                        }.bind(this),
                        error: function (msg2) { 
                            oTable.setBusy(false);
                            //busyDialog.close();
                        }.bind(this)


                    });
                }.bind(this),
                error: function (msg) {
                    //busyDialog.close();
                    oTable.setBusy(false);
                }.bind(this)
            });
        },


        _getwipprojectdata: function (oevent) {

            if(oevent !== undefined){
                this.pid = oevent.getParameter("arguments").pid;
            }

            // var busyDialog = new sap.m.BusyDialog({
            //     title:"Loading Data",
            //     text:"... now loading the data from a far away server"
            // }).open();
            var oTable = this.byId("wiptable");
            oTable.setBusy(true);
            
            const pid = this.pid,
                jrnlentrymdl = this.getOwnerComponent().getModel("jrnlentryMDL"),
                wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL"),

                projectfilter = new Filter("Project", FilterOperator.EQ, pid);

            const wipprojlist = this.getOwnerComponent().getModel(),
                engagementProjectFilter = new Filter("EngagementProject", FilterOperator.EQ, pid);
            wipprojlist.read("/YY1_WIPProjectListAPI1", {
                filters: [engagementProjectFilter],
                success: (odata) => {

                    var wipprojjson = new JSONModel();
                    wipprojjson.setData(odata.results[0]);
                    this.getView().setModel(wipprojjson, "prjlst");
                },
                error: (err) => {
                    MessageToast.show(err);
                    //busyDialog.close();
                }
            });
            jrnlentrymdl.read("/YY1_JournalEntryItem", {
                filters: [projectfilter],
                success: function (odata) {


                    
                   
                    var jsonmodelmainjrnlentry = new JSONModel();
                    jsonmodelmainjrnlentry.setData(odata.results);


                    // Read 2nd API wipedits
                    // var wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL");
                    wipeditsmdl.read("/YY1_WIPEDITS", {
                        success: function (odata2) {
                            oTable.setBusy(false);
                            var jsonmodelwipedit = new JSONModel();
                           
                            jsonmodelwipedit.setData(odata2.results);
                            debugger;
                            var changedflag = 0, newFlag = 0, updateflag =0;

                            for (var i = 0; i < odata.results.length; i++) {
                                for (var j = 0; j < odata2.results.length; j++) {
                                    if (odata.results[i].AccountingDocument === jsonmodelwipedit.oData[j].JEID) {
                                        
                                        odata.results[i].Status = "Updated";
                                        odata.results[i].StatusObject = "Error";
                                        odata.results[i].StatusIcon = 'sap-icon://edit';
                                        changedflag++;
                                        updateflag++;
                                        if(updateflag === 1){
                                            this.i = i;
                                        }
                                    }

                                }

                            }

                            for (var j = 0; j < odata2.results.length; j++) {
                                if (jsonmodelwipedit.oData[j].Status === "01" &  odata.results[0].Project === jsonmodelwipedit.oData[j].ProjectID) {
                                    odata.results[odata.results.length] = {}
                                    odata.results[odata.results.length - 1].AccountingDocument = jsonmodelwipedit.oData[j].JEID,
                                    odata.results[odata.results.length - 1].Project = jsonmodelwipedit.oData[j].ProjectID,
                                    odata.results[odata.results.length - 1].DocumentItemText = jsonmodelwipedit.oData[j].Notes,
                                    odata.results[odata.results.length - 1].WBSElement = jsonmodelwipedit.oData[j].WBS,
                                    odata.results[odata.results.length - 1].Quantity = jsonmodelwipedit.oData[j].Quantity
                                    odata.results[odata.results.length - 1].Status = "New";
                                    odata.results[odata.results.length - 1].StatusObject = "Information";
                                    odata.results[odata.results.length - 1].StatusIcon = 'sap-icon://notes';
                                    newFlag++;
                                }
                                if (jsonmodelwipedit.oData[j].Status === "02" 
                                &  odata.results[0].Project === jsonmodelwipedit.oData[j].ProjectID
                                    & this.accdocjeid === jsonmodelwipedit.oData[j].JEID
                                    ) {
                                        odata.results[this.i] = {}
                                        odata.results[this.i].AccountingDocument = jsonmodelwipedit.oData[j].JEID,
                                        odata.results[this.i].Project = jsonmodelwipedit.oData[j].ProjectID,                                  
                                        odata.results[this.i].Quantity = jsonmodelwipedit.oData[j].Quantity,
                                        odata.results[this.i].WBSElement = jsonmodelwipedit.oData[j].WBS,
                                       // odata.results[this.i].Quantity = jsonmodelwipedit.oData[j].Quantity,
                                        odata.results[this.i].DocumentItemText = jsonmodelwipedit.oData[j].Notes
                                        odata.results[this.i].Status = "New";
                                        odata.results[this.i].StatusObject = "Information";
                                        odata.results[this.i].StatusIcon = 'sap-icon://notes';

                        }

                            }
                  

                            var changedjson = new JSONModel();
                            changedjson.setData(changedflag);
                            this.getView().setModel(changedjson, "changedcount");

                            var newcount = newFlag;
                            var newjson = new JSONModel();
                            newjson.setData(newcount);
                            this.getView().setModel(newjson, "newcount");

                            var orignal = odata.results.length- newcount - changedflag;
                            var orignaljson = new JSONModel();
                            orignaljson.setData(orignal);
                            this.getView().setModel(orignaljson, "orignal");

                            var count = new JSONModel();
                            count.setData(odata.results.length);
                            this.getView().setModel(count, "count1"); 

                            this.getView().byId("wiptable").setModel(jsonmodelmainjrnlentry, "wipentry");
                            //busyDialog.close();
                            // this.getView().byId("wiptable").setModel(jsonmodelwipedit, "wipentry");
                        }.bind(this),
                        error: function (msg2) { 
                            oTable.setBusy(false);
                            //busyDialog.close();
                        }.bind(this)


                    });
                }.bind(this),
                error: function (msg) {
                    //busyDialog.close();
                    oTable.setBusy(false);
                }.bind(this)
            });

            /*     promiseJournalItems = new Promise((res, rej) => {
                    jrnlentrymdl.read("/YY1_JournalEntryItem", {
                        filters: [projectfilter],
                        success: (odata) => {
                            res(odata);
                        },
                        error: (oError) => {
                            rej(oError);
                        }
                    });
                }),
                promiseWipedit = new Promise((res, rej) => {
                    wipeditsmdl.read("/YY1_WIPEDITS", {
                        success: (odata) => {
                            res(odata);
                        },
                        error: (oError) => {
                            rej(oError);
                        }
                    });
                });
            Promise.all([promiseJournalItems, promiseWipedit]).then((data) => {
                data[1].results.forEach(WipeItems => {
                    data[0].results.forEach(JournalItems => {
                        if (WipeItems.JEID === JournalItems.AccountingDocument) {
                            JournalItems.Status = "Changed";
                            return false;
                        }
                    });
                });
                const jsonmodel = new JSONModel();
                jsonmodel.setData(data[0].results);
                this.getView().byId("wiptable").setModel(jsonmodel, "wipentry");
            }).catch(err => {
                MessageToast.show(err.message)
            });*/

            // var projectfilter = new Filter("Project", FilterOperator.EQ, pid);


        },
        onSuggestionItemSelected: function(oevent) {
			var oSelectedRow = oevent.getParameter("selectedRow").getBindingContext("wipentry").getObject();

			var jsonarray = [];
			// var finalarray = [];

			var owndata = {
				AccountingDocument: oSelectedRow.AccountingDocument,
                ReferenceDocument: oSelectedRow.ReferenceDocument,
                WBSElement: oSelectedRow.WBSElement,
                AmountInGlobalCurrency: oSelectedRow.AmountInGlobalCurrency,
                DocumentItemText: oSelectedRow.DocumentItemText
				
			};
			jsonarray.push(owndata);

			// jsonarray = {
			// 	"" : finalarray
			// };

			var jsonmodel = new JSONModel();
			jsonmodel.setData(jsonarray);
			this.getView().byId("wiptable").setModel(jsonmodel, "wipentry");

		}, 
        _searchaccdoc: function (oevent) {

            var xfilter = [];
            var filterproj = new Filter("Project", FilterOperator.EQ, this.pid);
            var filterwip = new Filter("AccountingDocument", FilterOperator.EQ, oevent.getParameter("value"));
            xfilter.push(filterproj);
            xfilter.push(filterwip);
            var finalfilter = new Filter({filters: xfilter, and: true});
            var bindings = this.getView().byId("wiptable").getBinding("items");
            bindings.filter([finalfilter]);


        },
        _newjecreation: function (oevent) {

            // create dialog lazily
            // if (!this.nDialog) {
            // this.nDialog = this.loadFragment({
            // name: "com.chappota.wippoc2.wipproject2.fragments.S2_New_WIP"
            // });
            // }
            // this.nDialog.then(function(oDialog) {
            // oDialog.open();


            // });
            if (!this.nDialog) {
                this.nDialog = sap.ui.xmlfragment(this.getView().getId(), "com.chappota.wippoc2.wipproject2.fragments.S2_New_WIP", this);
                this.getView().addDependent(this.nDialog);
            }

            this.nDialog.open();
            //        var projectid = this.byId("newprojectid").getValue();

            var unbilled = this.byId("newunbilled").getValue();
            var notes = this.byId("newnotes").getValue();
            var acttype = this.byId("newacttype").getValue();
            if (unbilled !== "") {
                this.byId("newunbilled").setValue();
            }
            if (notes !== "") {
                this.byId("newnotes").setValue();
            }
            if (acttype !== "") {
                this.byId("newacttype").setValue();
            }
        },

        _savenewrecord: function () {
            var wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL");
         wipeditsmdl.read("/YY1_WIPEDITS", {
            urlParameters : {
                "$select" : 'JEID',
                "$orderby" : 'JEID desc',
                "$top" : 1
                
            },
                        success:  (odata2) => {
                            var jsonmodelwipedit = new JSONModel();                        
                            jsonmodelwipedit.setData(odata2.results);
                            
                            var jeid = parseInt(odata2.results[0].JEID);

                            var newpayload = {
                               JEID: (jeid+1).toString(),
                                ID: "1",
                                Status: "01",
                                ProjectID: this.byId("newprojectid").getValue(),
                                Quantity: this.getView().byId("newunbilled").getValue(),
                                WBS: this.getView().byId("newworkpackage").getValue(),
                                Notes: this.getView().byId("newnotes").getValue(),
                                ActivityType: this.getView().byId("newacttype").getValue()
                                //          ServiceDate : "2022-07-29:T00:00:00" //this.getView().byId("newservicedate").getValue()  //
                            };
                            var saveapi = this.getOwnerComponent().getModel("wipeditsMDL");
                            saveapi.create("/YY1_WIPEDITS", newpayload, {
                                success: (odata) => {
                                    MessageToast.show("Record Created");
                                    //this.onInit();
                                    this.nDialog.close();
                                    this._getwipprojectdata();
                                    
                                },
                                error: (err) => {
                                    MessageToast.show(err);
                                    this.nDialog.close();
                                    
                                }
                            });

                            
                        },
                        error : (err) => { }
                    });

                  
                 
          
        },
        _editjerecord: function () {

            if(this.statustext === 'Original'){

                var editpayload = {
                    JEID:  this.accdocjeid,
                    Status: "02",
                    ID: "1",
                    ProjectID: this.byId("editrightprojectid").getValue(),
                    Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                    WBS: this.getView().byId("editrightwpkg").getValue(),
                    Notes: this.getView().byId("editrightnotes").getValue(),
                    ActivityType: this.getView().byId("editrightacttype").getValue()
                };

            var saveeditapi = this.getOwnerComponent().getModel("wipeditsMDL");
            saveeditapi.create("/YY1_WIPEDITS", editpayload, {
                                success: (odata) => {
                                   // MessageToast.show("Record Created");
                                    //this.onInit();
                                    this.pDialog.close();
                                    this._getwipprojectdata();
                                    
                                },
                                error: (err) => {
                                    MessageToast.show(err);
                                    this.pDialog.close();
                                    
                                }
                            });
            }
            if((this.statustext === 'Updated') || (this.statustext === 'New') ){
             
                var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID",FilterOperator.EQ,this.accdocjeid)
                editapi.read("/YY1_WIPEDITS",{
                    filters : [filterjeid],
                    success : (odata) => {

              

                        // for(var i=0;i<odata.results.length;++i){
                        //     if(odata.results[i].JEID === this.accdocjeid){
                        //        var esetguid = odata.results[i].SAP_UUID;
                        //     }
                        // }

                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            Status: "02",
                            ID: "1",
                            ProjectID: this.byId("editrightprojectid").getValue(),
                            Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                            WBS: this.getView().byId("editrightwpkg").getValue(),
                            Notes: this.getView().byId("editrightnotes").getValue(),
                            ActivityType: this.getView().byId("editrightacttype").getValue()
                        };
                       
                        var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                        //var eset = "/YY1_WIPEDITS('" + this.accdocjeid + "')";
                        //var esetguid = "42010a03-27dd-1eed-8390-6dc4fe7aa967";
                        var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                        editapi.update(esetwithguid, editpayload, {
                            success: (odata) => {
                                MessageToast.show("Updated!");
                                this._getwipprojectdata();
                                this.pDialog.close();
                                
                            },
                            error: (err) => {
                                MessageToast.show(err);
                                this.pDialog.close();
                                busyDialog.close();
                                
                            }
                        });
            

                    },
                    error : (err) => {



                    }



                });


          
        }
        },
        _wiptableselchange: function (oevent) {


            if (oevent.getParameter("selected")) {
                this.selflag ++;
                
                this.statustext = oevent.mParameters.listItem.mAggregations.cells[1].getText();
                this.accdocjeid = oevent.getSource().getModel("wipentry").getData()[oevent.getSource().getSelectedContextPaths()[0].split('/')[1]].AccountingDocument;
                this.qty = oevent.getSource().getModel("wipentry").getData()[oevent.getSource().getSelectedContextPaths()[0].split('/')[1]].Quantity;
                this.wrkpkg = oevent.getSource().getModel("wipentry").getData()[oevent.getSource().getSelectedContextPaths()[0].split('/')[1]].WBSElement;
                this.notes = oevent.getSource().getModel("wipentry").getData()[oevent.getSource().getSelectedContextPaths()[0].split('/')[1]].DocumentItemText;
                this.acttype = "A010";
            }else{
                this.selflag --;

            }

            if( (oevent.getParameter("selected")) & (oevent.getParameter("selectAll")) ){
                this.selflag = 2;
            }
            else{
                return;
            }
           
        },

        _closenewrecord: function () {
            // this.nDialog.then(function(oDialog) {
            // oDialog.close();
            // });
            this.nDialog.close();
        },
        _updatejeRecord: function (oevent) {


            if (!this.pDialog) {
                this.pDialog = sap.ui.xmlfragment(this.getView().getId(), "com.chappota.wippoc2.wipproject2.fragments.S2_Edited_WIP", this);
                this.getView().addDependent(this.pDialog);
            }
            if (this.selflag < 1) {
                MessageBox.alert("Please select atleast 1 row to edit");
            } 
            // else {
            //     this.pDialog.open();

            // }
           
            if (this.selflag === 1) {
               
              
                this.getView().byId("editleftunbilamnt").setText(this.qty);
                this.getView().byId("editleftwpkg").setText(this.wrkpkg);
                this.getView().byId("editleftnotes").setText(this.notes);
                this.getView().byId("editleftacttype").setText(this.acttype);

                if (this.getView().byId("editrightunbilamnt").getValue() !== '') {
                    this.getView().byId("editrightunbilamnt").setValue();
                }
                if (this.getView().byId("editrightwpkg").getValue() !== '') {
                    this.getView().byId("editrightwpkg").setValue();
                }
                if (this.getView().byId("editrightnotes").getValue() !== '') {
                    this.getView().byId("editrightnotes").setValue();
                }
                if (this.getView().byId("editrightacttype").getValue() !== '') {
                    this.getView().byId("editrightacttype").setValue();
                }


                this.getView().byId("editrightunbilamnt").setValue(this.qty);
                this.getView().byId("editrightwpkg").setValue(this.wrkpkg);
                this.getView().byId("editrightnotes").setValue(this.notes);
                this.getView().byId("editrightacttype").setValue(this.acttype);
                this.selflag = 0;
                this.pDialog.open();
            }
            if (this.selflag > 1) {
                
                
                this.getView().byId("editleftunbilamnt").setText("<Multiple Values>");
                this.getView().byId("editleftwpkg").setText("<Multiple Values>");
                this.getView().byId("editleftnotes").setText("<Multiple Values>");
                this.getView().byId("editleftacttype").setText("<Multiple Values>");
                this.selflag = 0;

                if (this.getView().byId("editrightunbilamnt").getValue() !== '') {
                    this.getView().byId("editrightunbilamnt").setValue();
                }
                if (this.getView().byId("editrightwpkg").getValue() !== '') {
                    this.getView().byId("editrightwpkg").setValue();
                }
                if (this.getView().byId("editrightnotes").getValue() !== '') {
                    this.getView().byId("editrightnotes").setValue();
                }
                if (this.getView().byId("editrightacttype").getValue() !== '') {
                    this.getView().byId("editrightacttype").setValue();
                }
                this.pDialog.open();

                // this.getView().byId("editrightunbilamnt").setValue(this.qty);
                // this.getView().byId("editrightwpkg").setValue(this.wrkpkg);
                // this.getView().byId("editrightnotes").setValue(this.notes);
                // this.getView().byId("editrightacttype").setValue(this.acttype);
            }

        },
        _closechangerecord: function () {
            this.pDialog.close();
            this.byId("wiptable").removeSelections();

        },

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        _onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({busy: true, delay: 0});
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) { // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this._bindView("/YY1_WIPProjectListAPI1" + sObjectId);
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (! oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.CompanyCode,
                sObjectName = oObject.YY1_WIPProjectListAPI1;

            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
