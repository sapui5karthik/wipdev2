sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/core/Fragment'

], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageToast, MessageBox,Fragment) {
    "use strict";

    return BaseController.extend("com.chappota.wippoc2.wipproject2.controller.Object", {

        formatter: formatter,
      
        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */
        onInit: function () {
            this.selflag = 0;
            this.editflag = false;
            this.multistatus=[],this.multiaccdoc=[],this.multiprojid=[],this.multiqty=[],this.multiwbs=[],this.multinotes=[],this.multiacttype=[],this.multiservdate = [];
            
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("object").attachPatternMatched(this._getwipprojectdata, this);


        },
        _tableDataReusable() {
            var oTable = this.byId("wiptable");
            oTable.setBusy(true);
            const pid = this.pid, cc = this.compcode,
                jrnlentrymdl = this.getOwnerComponent().getModel("jrnlentryMDL"),
                wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL"),
                compcodefilter = new Filter("CompanyCode",FilterOperator.EQ,cc),
                projectfilter = new Filter("Project", FilterOperator.EQ, pid);

            const wipprojlist = this.getOwnerComponent().getModel(),
                
                engagementProjectFilter = new Filter("ProjectID", FilterOperator.EQ, pid);
            wipprojlist.read("/ProjectSet", {
                filters: [engagementProjectFilter],
                success: (odata) => {

                    var wipprojjson = new JSONModel();
                    wipprojjson.setData(odata.results[0]);
                    this.getView().setModel(wipprojjson, "prjlst");
                },
                error: (err) => {
                    MessageToast.show(err);

                }
            });
            jrnlentrymdl.read("/YY1_JournalEntryItem", {
                filters: [projectfilter,compcodefilter],
                success: function (odata) {

                if(odata.results[0] !== undefined){
                   
                        this.personalnumber = odata.results[0].PersonnelNumber;
                    }
                   
                    var jsonmodelmainjrnlentry = new JSONModel();
                    jsonmodelmainjrnlentry.setData(odata.results);
      
                    // Read 2nd API wipedits
                    var projidfilter = new Filter("ProjectID", FilterOperator.EQ, pid);
                    wipeditsmdl.read("/YY1_WIPEDITS", {
                        filters: [projidfilter],
                        success: function (odata2) {
                            
                            oTable.setBusy(false);
                            var jsonmodelwipedit = new JSONModel();

                            jsonmodelwipedit.setData(odata2.results);

                            var changedflag = 0,
                                newFlag = 0,
                                updateflag = 0;
                                for (var i = 0; i < odata.results.length; i++) {
                                    for (var j = 0; j < odata2.results.length; j++) {
                                     if(odata.results[i].AccountingDocument === jsonmodelwipedit.oData[j].JEID){
                                        if(jsonmodelwipedit.oData[j].Status === "11" ){ 
                                            odata.results[i].Status = "Original";
                                            odata.results[i].StatusObject = "None";
                                            odata.results[i].StatusIcon = 'sap-icon://delete';

                                            odata.results[i].AccountingDocument = jsonmodelwipedit.oData[j].JEID;                                


                                            odata.results[i].Quantity = jsonmodelwipedit.oData[j].Quantity;
                                            odata.results[i].WBSElement = jsonmodelwipedit.oData[j].WBS;
                                            odata.results[i].DocumentItemText = jsonmodelwipedit.oData[j].Notes;
                                            odata.results[i].CostCtrActivityType = jsonmodelwipedit.oData[j].ActivityType;
                                            odata.results[i].ServicesRenderedDate = jsonmodelwipedit.oData[j].ServiceDate;
                                        }
                                    }

                                    }
                                }
                               

                            for (var i = 0; i < odata.results.length; i++) {
                                for (var j = 0; j < odata2.results.length; j++) {

                                    if (odata.results[i].AccountingDocument === jsonmodelwipedit.oData[j].JEID) {

                                        if(jsonmodelwipedit.oData[j].Status === "02"){ 

                                        odata.results[i].Status = "Updated";
                                        odata.results[i].StatusObject = "Error";
                                        odata.results[i].StatusIcon = 'sap-icon://edit';
                                        odata.results[i].Quantity = jsonmodelwipedit.oData[j].Quantity;
                                        odata.results[i].WBSElement = jsonmodelwipedit.oData[j].WBS;
                                        odata.results[i].DocumentItemText = jsonmodelwipedit.oData[j].Notes;
                                        odata.results[i].CostCtrActivityType = jsonmodelwipedit.oData[j].ActivityType;
                                        odata.results[i].ServicesRenderedDate = jsonmodelwipedit.oData[j].ServiceDate;
                                        

                                        // ActivityType
                                        changedflag++;
                                        updateflag++;
                                        if (updateflag === 1) {
                                            this.i = i;
                                        }
                                    }

                                    if(jsonmodelwipedit.oData[j].Status === "12"){
                                        odata.results[i].Status = "Updated";
                                        odata.results[i].StatusObject = "None";
                                        odata.results[i].StatusIcon = 'sap-icon://delete';
                                        odata.results[i].Quantity = jsonmodelwipedit.oData[j].Quantity;
                                        odata.results[i].WBSElement = jsonmodelwipedit.oData[j].WBS;
                                        odata.results[i].DocumentItemText = jsonmodelwipedit.oData[j].Notes;
                                        odata.results[i].CostCtrActivityType = jsonmodelwipedit.oData[j].ActivityType;
                                        odata.results[i].ServicesRenderedDate = jsonmodelwipedit.oData[j].ServiceDate;

                                    }
                                    }
                                    

                                }

                            }

                            for (var j = 0; j < odata2.results.length; j++) {
                              //  if ((jsonmodelwipedit.oData[j].Status === "01" & odata.results[0].Project === jsonmodelwipedit.oData[j].ProjectID)) {
                                if ((jsonmodelwipedit.oData[j].Status === "01")) {
                                    odata.results[odata.results.length] = {}
                                    odata.results[odata.results.length - 1].AccountingDocument = jsonmodelwipedit.oData[j].JEID;
                                    odata.results[odata.results.length - 1].Project = jsonmodelwipedit.oData[j].ProjectID;
                                    odata.results[odata.results.length - 1].DocumentItemText = jsonmodelwipedit.oData[j].Notes;
                                    odata.results[odata.results.length - 1].WBSElement = jsonmodelwipedit.oData[j].WBS;
                                    odata.results[odata.results.length - 1].Quantity = jsonmodelwipedit.oData[j].Quantity;
                                    odata.results[odata.results.length - 1].CostCtrActivityType = jsonmodelwipedit.oData[j].ActivityType;
                                    odata.results[odata.results.length - 1].ServicesRenderedDate = jsonmodelwipedit.oData[j].ServiceDate;
                                    odata.results[odata.results.length - 1].PersonnelNumber =this.personalnumber;
                                    odata.results[odata.results.length - 1].GLAccount = "<New>";
                                    odata.results[odata.results.length - 1].ReferenceDocument = "<New>";
                                    odata.results[odata.results.length - 1].AmountInGlobalCurrency = "<New>";
                                    odata.results[odata.results.length - 1].Status = "New";
                                    odata.results[odata.results.length - 1].StatusObject = "Information";
                                    odata.results[odata.results.length - 1].StatusIcon = 'sap-icon://notes';
                                    newFlag++;
                                }
                                if(jsonmodelwipedit.oData[j].Status === "13"){
                                    odata.results[odata.results.length] = {}
                                    odata.results[odata.results.length - 1].AccountingDocument = jsonmodelwipedit.oData[j].JEID;
                                    odata.results[odata.results.length - 1].Project = jsonmodelwipedit.oData[j].ProjectID;
                                    odata.results[odata.results.length - 1].DocumentItemText = jsonmodelwipedit.oData[j].Notes;
                                    odata.results[odata.results.length - 1].WBSElement = jsonmodelwipedit.oData[j].WBS;
                                    odata.results[odata.results.length - 1].Quantity = jsonmodelwipedit.oData[j].Quantity;
                                    odata.results[odata.results.length - 1].CostCtrActivityType = jsonmodelwipedit.oData[j].ActivityType;
                                    odata.results[odata.results.length - 1].ServicesRenderedDate = jsonmodelwipedit.oData[j].ServiceDate;
                                    odata.results[odata.results.length - 1].PersonnelNumber = this.personalnumber;
                                    odata.results[odata.results.length - 1].GLAccount = "<New>";
                                    odata.results[odata.results.length - 1].ReferenceDocument = "<New>";
                                    odata.results[odata.results.length - 1].AmountInGlobalCurrency = "<New>";
                                    odata.results[odata.results.length - 1].Status = "New";
                                    odata.results[odata.results.length - 1].StatusObject = "None";
                                    odata.results[odata.results.length - 1].StatusIcon = 'sap-icon://delete';
                                   
                                }

                            }
                          
                            

                            var changedjson = new JSONModel();
                            changedjson.setData(changedflag);
                            this.getView().setModel(changedjson, "changedcount");

                            var newcount = newFlag;
                            var newjson = new JSONModel();
                            newjson.setData(newcount);
                            this.getView().setModel(newjson, "newcount");

                            var orignal = odata.results.length - newcount - changedflag;
                            var orignaljson = new JSONModel();
                            orignaljson.setData(orignal);
                            this.getView().setModel(orignaljson, "orignal");

                            var count = new JSONModel();
                            count.setData(odata.results.length);
                            this.getView().setModel(count, "count1");

                            this.getView().byId("wiptable").setModel(jsonmodelmainjrnlentry, "wipentry");

                        }.bind(this),
                        error: function (msg2) {
                            oTable.setBusy(false);

                        }.bind(this)


                    });
         
                }.bind(this),
                error: function (msg) {
                    oTable.setBusy(false);
                }.bind(this)
            });
        

        },
        _notespopover : function(oEvent){
            var oButton = oEvent.getSource(),
            notes = oEvent.getSource().getBindingContext("wipentry").getProperty("DocumentItemText"),
            oView = this.getView();
            
        if(!this.noteslink){
            this.noteslink = sap.ui.xmlfragment(this.getView().getId(),"com.chappota.wippoc2.wipproject2.fragments.S2_NotesPopover",this);
            oView.addDependent(this.noteslink);
            
        }
        this.byId("popovernotes").setText(notes);
        this.noteslink.openBy(oButton);
        
        },


        _refreshWipTable: function () {
            this.byId("suggestionhelpbox").setValue();
            this._tableDataReusable();

        },
        _getwipprojectdata: function (oevent) {

            if (oevent !== undefined) {
                
                this.pid = oevent.getParameter("arguments").pid;
                this.custid = oevent.getParameter("arguments").custid;
                this.compcode = oevent.getParameter("arguments").orgid;
               // this.personalnumber = oevent.getParameter("arguments").prnr;
            }
            this._tableDataReusable();


        },
        onSuggestionItemSelected: function (oevent) {
            
            var oSelectedRow = oevent.getParameter("selectedRow").getBindingContext("wipentry").getObject();

            var jsonarray = [];


            var owndata = {
                Status: oSelectedRow.Status,
                StatusIcon: oSelectedRow.StatusIcon,
                StatusObject: oSelectedRow.StatusObject,
                AccountingDocument: oSelectedRow.AccountingDocument,
                GLAccount: oSelectedRow.GLAccount,
                ReferenceDocument: oSelectedRow.ReferenceDocument,
                Customer: oSelectedRow.Customer,
                Project: oSelectedRow.Project,
                Quantity: oSelectedRow.Quantity,
                WorkItem: oSelectedRow.WorkItem,
                WBSElement: oSelectedRow.WBSElement,
                AmountInGlobalCurrency: oSelectedRow.AmountInGlobalCurrency,
                DocumentItemText: oSelectedRow.DocumentItemText

            };
            jsonarray.push(owndata);


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


            if (!this.nDialog) {
                this.nDialog = sap.ui.xmlfragment(this.getView().getId(), "com.chappota.wippoc2.wipproject2.fragments.S2_New_WIP", this);
                this.getView().addDependent(this.nDialog);
            }

            this.nDialog.open();


            var unbilled = this.byId("newunbilled").getValue();
            var notes = this.byId("newnotes").getValue();
            var acttype = this.byId("newacttype").getValue();
            this.byId("newprnr").setValue(this.prnr);
            this.getView().byId("newservicedate").setValue(this.formatter.dateTime(new Date()));
            this.byId("newcustomerid2").setValue(this.custid);
            if (unbilled !== "") {
                this.byId("newunbilled").setValue();
            }
            if (notes !== "") {
                this.byId("newnotes").setValue();
            }
         
        },
        _closenewrecord: function () {

            this.nDialog.close();
            this.byId("wiptable").removeSelections();
            this.selflag = 0;
        },
        _savenewrecord: function () {
            var wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL");
            wipeditsmdl.read("/YY1_WIPEDITS", {
                urlParameters: {
                    "$select": 'JEID',
                    "$orderby": 'JEID desc',
                    "$top": 1

                },
                success: (odata2) => {
                    var jsonmodelwipedit = new JSONModel();
                    jsonmodelwipedit.setData(odata2.results);

                    var jeid = parseInt(odata2.results[0].JEID);

                    var newpayload = {
                        JEID: (jeid + 1).toString(),
                        ID: "1",
                        Status: "01",
                        ProjectID: this.byId("newprojectid").getValue(),
                        Quantity: this.getView().byId("newunbilled").getValue(),
                        WBS: this.getView().byId("newworkpackage").getValue(),
                        Notes: this.getView().byId("newnotes").getValue(),
                        ActivityType: this.getView().byId("newacttype").getValue(),
                        ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("newservicedate").getValue())
                    };
                    var saveapi = this.getOwnerComponent().getModel("wipeditsMDL");
                    saveapi.create("/YY1_WIPEDITS", newpayload, {
                        success: (odata) => {
                            MessageToast.show("Record Created");
                            // this.onInit();
                            this.nDialog.close();
                            this._getwipprojectdata();

                        },
                        error: (err) => {
                            MessageToast.show(err);
                            this.nDialog.close();

                        }
                    });


                },
                error: (err) => {
                    MessageToast.show(err);
                }
            });


        },
        _multiEditUpdated : function(multiaccdoc){
            debugger;
            // for(i=0;i<this.multistatus.length;i++){
                var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID", FilterOperator.EQ, multiaccdoc)
                editapi.read("/YY1_WIPEDITS", {
                    filters: [filterjeid],
                    success: (odata) => {


                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            Status: "02",
                            ID: "1",
                            ProjectID: this.byId("editrightprojectid").getValue(),
                            Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                            WBS: this.getView().byId("editrightwpkg").getValue(),
                            Notes: this.getView().byId("editrightnotes").getValue(),
                            ActivityType: this.getView().byId("editrightacttype").getValue(),
                            ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
                        };

                        var editapi = this.getOwnerComponent().getModel("wipeditsMDL");

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
                                this.byId("wiptable").removeSelections();

                            }
                        });


                    },
                    error: (err) => {
                        this.byId("wiptable").removeSelections();
                    }


                });
            // }
        },
        _multiEditOriginal : function(multiaccdoc){
            var editpayload = {
                JEID: multiaccdoc,
                Status: "02",
                ID: "1",
                ProjectID: this.byId("editrightprojectid").getValue(),
                Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                WBS: this.getView().byId("editrightwpkg").getValue(),
                Notes: this.getView().byId("editrightnotes").getValue(),
                ActivityType: this.getView().byId("editrightacttype").getValue(),
                ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
            };

            var saveeditapi = this.getOwnerComponent().getModel("wipeditsMDL");
            saveeditapi.create("/YY1_WIPEDITS", editpayload, {
                success: (odata) => {
                    // MessageToast.show("Record Created");
                    // this.onInit();
                    this.pDialog.close();
                    this._getwipprojectdata();

                },
                error: (err) => {
                    MessageToast.show(err);
                    this.pDialog.close();
                    this.byId("wiptable").removeSelections();

                }
            });
        },
        _multiEditNew : function(multiaccdoc){
            var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
            var filterjeid = new Filter("JEID", FilterOperator.EQ, multiaccdoc)
            editapi.read("/YY1_WIPEDITS", {
                filters: [filterjeid],
                success: (odata) => {


                    var esetguid = odata.results[0].SAP_UUID;

                    var editpayload = {
                        Status: "01",
                        ID: "1",
                        ProjectID: this.byId("editrightprojectid").getValue(),
                        Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                        WBS: this.getView().byId("editrightwpkg").getValue(),
                        Notes: this.getView().byId("editrightnotes").getValue(),
                        ActivityType: this.getView().byId("editrightacttype").getValue(),
                        ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
                    };

                    var editapi = this.getOwnerComponent().getModel("wipeditsMDL");

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
                            this.byId("wiptable").removeSelections();
                            

                        }
                    });


                },
                error: (err) => {
                    this.byId("wiptable").removeSelections();
                }


            });
        },

        _editjerecord: function () {

                        if(this.editflag){
                            MessageToast.show("Multi Edit");
                            for(var i=0;i<this.multistatus.length;i++){
                                if(this.multistatus[i]==='Updated'){
                                    debugger;
                                    this._multiEditUpdated(this.multiaccdoc[i]);
                                }
                                if(this.multistatus[i]==='Original'){
                                    this._multiEditOriginal(this.multiaccdoc[i]);
                                }
                                if(this.multistatus[i]==='New'){
                                    this._multiEditNew(this.multiaccdoc[i]);
                                }
                            }
                        }
                        else {

            if (this.statustext === 'Original') {

                var editpayload = {
                    JEID: this.accdocjeid,
                    Status: "02",
                    ID: "1",
                    ProjectID: this.byId("editrightprojectid").getValue(),
                    Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                    WBS: this.getView().byId("editrightwpkg").getValue(),
                    Notes: this.getView().byId("editrightnotes").getValue(),
                    ActivityType: this.getView().byId("editrightacttype").getValue(),
                   ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
                };

                var saveeditapi = this.getOwnerComponent().getModel("wipeditsMDL");
                saveeditapi.create("/YY1_WIPEDITS", editpayload, {
                    success: (odata) => {
                        // MessageToast.show("Record Created");
                        // this.onInit();
                        this.pDialog.close();
                        this._getwipprojectdata();

                    },
                    error: (err) => {
                        MessageToast.show(err);
                        this.pDialog.close();
                        this.byId("wiptable").removeSelections();

                    }
                });
            }
            
            if ((this.statustext === 'Updated')) {

                var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID", FilterOperator.EQ, this.accdocjeid)
                editapi.read("/YY1_WIPEDITS", {
                    filters: [filterjeid],
                    success: (odata) => {


                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            Status: "02",
                            ID: "1",
                            ProjectID: this.byId("editrightprojectid").getValue(),
                            Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                            WBS: this.getView().byId("editrightwpkg").getValue(),
                            Notes: this.getView().byId("editrightnotes").getValue(),
                            ActivityType: this.getView().byId("editrightacttype").getValue(),
                           ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
                        //    ServiceDate: "2022-01-01T00:00:00"
                        };

                        var editapi = this.getOwnerComponent().getModel("wipeditsMDL");

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
                                this.byId("wiptable").removeSelections();

                            }
                        });


                    },
                    error: (err) => {
                        this.byId("wiptable").removeSelections();
                    }


                });


            }
            if ((this.statustext === 'New')) {

                var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID", FilterOperator.EQ, this.accdocjeid)
                editapi.read("/YY1_WIPEDITS", {
                    filters: [filterjeid],
                    success: (odata) => {


                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            Status: "01",
                            ID: "1",
                            ProjectID: this.byId("editrightprojectid").getValue(),
                            Quantity: this.getView().byId("editrightunbilamnt").getValue(),
                            WBS: this.getView().byId("editrightwpkg").getValue(),
                            Notes: this.getView().byId("editrightnotes").getValue(),
                            ActivityType: this.getView().byId("editrightacttype").getValue(),
                            ServiceDate: this.formatter.dateTimebackendwithtime(this.getView().byId("editrightservdate").getValue())
                        };

                        var editapi = this.getOwnerComponent().getModel("wipeditsMDL");

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
                                this.byId("wiptable").removeSelections();
                                

                            }
                        });


                    },
                    error: (err) => {
                        this.byId("wiptable").removeSelections();
                    }


                });

            }
            }
        },
             /****
         * Method to Finalize the record
         */             
        _finalizeRecord: function(oevent){
            if(this.statustext === "Original") {
                MessageToast.show("Original cant be Finalized");
            }
            if(this.statustext === "Updated") { 
                var sttext = 'U';
                var sttimsesheetid = this.timesheetrecordref.padStart(12,'0');
                //(HARD CODED THIS.  Should be replaced by the DATE from the screen)
                var sttimesheetdate = this.formatter.dateTimebackendwithtime(this.timesheetdate);//"2022-02-23T00:00:00";
                var personalnum = this.personalnumber;
                var personalextid = "99999737";
                var timesheetstatus = "";
            }
            if(this.statustext === "New"){ 
                var sttext = 'C';
                var sttimsesheetid = ""; 
                //(HARD CODED THIS.  Should be replaced by the DATE from the screen)                
                var sttimesheetdate = this.formatter.dateTimebackendwithtime(this.timesheetdate);;
                var personalnum = this.personalnumber;
                var personalextid = "";
                var timesheetstatus = "30";
            }
            var finalRecordPayload = {
                "TimeSheetDataFields": {
                    "ControllingArea": "A000", // (Hard Code)
                    //"SenderCostCenter": "1720P001", // (Hard code)
                    "ActivityType": this.acttype,//"T001", //this.acttype, // (From the record – “Activity Type”)
                    "WBSElement": this.wrkpkg, // (From the record – “WBS Element”)
                    "RecordedHours": this.qty, // (From the record – “Unbilled Quantity”)
                    "RecordedQuantity": this.qty, // (From the record – “Unbilled Quantity”)
                    "HoursUnitOfMeasure": "H", // (Hard Code)
                    "TimeSheetNote": this.notes
                },
                "CompanyCode": "1720", // (Hard Code)
                //"PersonWorkAgreementExternalID": personalextid,
                "PersonWorkAgreement": personalnum, // (Optional, Will be included in the Screen 2 API)
                "TimeSheetRecord": sttimsesheetid,
                "TimeSheetDate": sttimesheetdate, // (From the record – “Timesheet date”)
                "TimeSheetIsReleasedOnSave": true, // (Hard Code)
                //"TimeSheetStatus": timesheetstatus, // (Hard Code)
                "TimeSheetOperation": sttext // (Use “C” for new, “U” for Edited and “D” for deleted)
            };
            debugger;
            if(this.statustext === 'New'){
            var wipsaves = this.getOwnerComponent().getModel("wipsavesMDL");
          
            wipsaves.create("/TimeSheetEntryCollection", finalRecordPayload, {
                success: (odata) => {              
                   
                    
                    MessageToast.show("Record posted");      
                 //   this._getwipprojectdata();            
                  this._newAfterFinalized();                 

                },
                error: (err) => {
                    
                    MessageToast.show(err);
                    this.byId("wiptable").removeSelections();

                }
            });
        }
        if(this.statustext === 'Updated'){
            var wipsaves = this.getOwnerComponent().getModel("wipsavesMDL");
            var wipwithaied = "/TimeSheetEntryCollection";
            wipsaves.create(wipwithaied, finalRecordPayload, {
                success: (odata) => {              
                   
                   MessageToast.show("Record posted");
                   this.byId("wiptable").removeSelections();
                    this._getwipprojectdata();
                },
                error: (err) => {
                    
                    MessageToast.show(err);
                    this.byId("wiptable").removeSelections();
                }
            });
        }

        },
        _newAfterFinalized : function(){
            var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
            var filterjeid = new Filter("JEID", FilterOperator.EQ, this.accdocjeid)
            editapi.read("/YY1_WIPEDITS", {
                filters: [filterjeid],
                success: (odata) => {


                    var esetguid = odata.results[0].SAP_UUID;

                    var editpayload = {
                        Status: "14"
                     
                    };

                    var editapi = this.getOwnerComponent().getModel("wipeditsMDL");

                    var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                    editapi.update(esetwithguid, editpayload, {
                        success: (odata) => {
                            //MessageToast.show("Updated!");
                            this._getwipprojectdata();
                           // this.pDialog.close();

                        },
                        error: (err) => {
                            MessageToast.show(err);
                            this.byId("wiptable").removeSelections();

                        }
                    });


                },
                error: (err) => {}


            });

        },

        _wiptableselchange: function (oevent) {
            // var statustextall=[];
            // var jsonarray = [];

            if (oevent.getParameter("selected")) {
                this.selflag ++;
                this.statustext = oevent.getParameter("listItems")[0].mAggregations.cells[1].mProperties.text;
                this.accdocjeid = oevent.getParameter("listItems")[0].mAggregations.cells[2].mProperties.text;

                this.glaccnt = oevent.getParameter("listItems")[0].mAggregations.cells[3].mProperties.text;
                this.timesheetrecordref = oevent.getParameter("listItems")[0].mAggregations.cells[4].mProperties.text;
                this.customer = oevent.getParameter("listItems")[0].mAggregations.cells[5].mProperties.text;
                this.project = oevent.getParameter("listItems")[0].mAggregations.cells[6].mProperties.text;
                this.qty = oevent.getParameter("listItems")[0].mAggregations.cells[7].mProperties.text;
                this.wrkpkg = oevent.getParameter("listItems")[0].mAggregations.cells[9].mProperties.text;
                this.amnt = oevent.getParameter("listItems")[0].mAggregations.cells[10].mProperties.text;
                this.acttype = oevent.getParameter("listItems")[0].mAggregations.cells[11].mProperties.text;
                this.prnr = oevent.getParameter("listItems")[0].mAggregations.cells[12].mProperties.text;
                this.timesheetdate = oevent.getParameter("listItems")[0].mAggregations.cells[13].mProperties.text;
               this.notes = oevent.getParameter("listItems")[0].mAggregations.cells[14].mProperties.text;

                var tablepayload = {
                    "Status"	: this.statustext,
                    "AccountingDocument" :	this.accdocjeid,
                    "GLAccount" :	this.glaccnt,
                    "ReferenceDocument" :	this.timesheetrecordref,
                    "Customer" :	this.customer,
                    "Project" :	this.project,
                    "Quantity" :	this.qty,
                    "WBSElement" :	this.wrkpkg ,
                    "AmountInGlobalCurrency" :	 this.amnt,
                    "CostCtrActivityType" :	this.acttype,
                    "PersonnelNumber" :	this.prnr,
                    "ServicesRenderedDate" : this.timesheetdate,
                    "DocumentItemText" :	 this.notes             


                };      

              


            
              var status,accdoc,projid,qty,wbs,notes,acttype,servdate;
               status =  tablepayload.Status;
               accdoc = tablepayload.AccountingDocument;
               projid = tablepayload.Project ;
               qty = tablepayload.Quantity ;
               wbs = tablepayload.WBSElement ;
               notes = tablepayload.DocumentItemText ;
               acttype = tablepayload.CostCtrActivityType ;
               servdate = tablepayload.ServicesRenderedDate ;

               this.multistatus.push(status);
               this.multiaccdoc.push(accdoc);
               this.multiprojid.push(projid);
               this.multiqty.push(qty);
               this.multiwbs.push(wbs);
               this.multinotes.push(notes);
               this.multiacttype.push(acttype);
               this.multiservdate.push(servdate);
           
                    
              if(this.selflag > 1){
                  this.editflag = true;
              }else{
                  this.editflag = false;
              }


            } else {
                this.selflag --;

            }
           

            if ((oevent.getParameter("selected")) & (oevent.getParameter("selectAll"))) {
                this.selflag = 2;
            } else {
                return;
            }

        },

      
        _updatejeRecord: function (oevent) {


            if (!this.pDialog) {
                this.pDialog = sap.ui.xmlfragment(this.getView().getId(), "com.chappota.wippoc2.wipproject2.fragments.S2_Edited_WIP", this);
                this.getView().addDependent(this.pDialog);
            }
            if (this.selflag < 1) {
                MessageBox.alert("Please select atleast 1 row to edit");
            }


            if (this.selflag === 1) {


                this.getView().byId("editleftunbilamnt").setText(this.qty);
                this.getView().byId("editleftwpkg").setText(this.wrkpkg);
                this.getView().byId("editleftnotes").setText(this.notes);
                this.getView().byId("editleftacttype").setText(this.acttype);
                this.byId("editleftprnr").setText(this.prnr);
                this.byId("editrightprnr").setValue(this.prnr);

                this.getView().byId("editleftservdate").setText(this.formatter.dateTime(this.timesheetdate));

                if (this.getView().byId("editrightunbilamnt").getValue() !== '') {
                    this.getView().byId("editrightunbilamnt").setValue();
                }
                if (this.getView().byId("editrightwpkg").getValue() !== '') {
                    this.getView().byId("editrightwpkg").setValue();
                }
                if (this.getView().byId("editrightnotes").getValue() !== '') {
                    this.getView().byId("editrightnotes").setValue();
                }
                // if (this.getView().byId("editrightacttype").getValue() !== '') {
                //     this.getView().byId("editrightacttype").setValue();
                // }
                if (this.getView().byId("editrightservdate").getValue() !== '') {
                    this.getView().byId("editrightservdate").setValue();
                }


                this.getView().byId("editrightunbilamnt").setValue(this.qty);
                this.getView().byId("editrightwpkg").setValue(this.wrkpkg);
                this.getView().byId("editrightnotes").setValue(this.notes);
                this.getView().byId("editrightacttype").setValue("T001");
                this.getView().byId("editrightservdate").setValue(this.formatter.dateTime(this.timesheetdate));

                this.selflag = 0;
                this.pDialog.open();
            }
            if (this.selflag > 1) {
                this.editflag = true;

                this.getView().byId("editleftunbilamnt").setText("<Multiple Values>");
                this.getView().byId("editleftwpkg").setText("<Multiple Values>");
                this.getView().byId("editleftnotes").setText("<Multiple Values>");
                this.getView().byId("editleftacttype").setText("<Multiple Values>");
                this.getView().byId("editleftservdate").setText("<Multiple Values>");

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
                this.getView().byId("editrightacttype").setValue("T001");
                // if (this.getView().byId("editrightacttype").getValue() !== '') {
                //     this.getView().byId("editrightacttype").setValue();
                // }
                if (this.getView().byId("editrightservdate").getValue() !== '') {
                    this.getView().byId("editrightservdate").setValue();
                }
                this.pDialog.open();


            }

        },
        _closechangerecord: function () {
            this.pDialog.close();
            this.byId("wiptable").removeSelections();
            this.selflag = 0;

        },
        _multiDeleteUpdated : function(multiaccdoc){
            var delapi = this.getOwnerComponent().getModel("wipeditsMDL");
            var filterjeid = new Filter("JEID", FilterOperator.EQ, multiaccdoc)
            delapi.read("/YY1_WIPEDITS", {
                filters: [filterjeid],
                success: (odata) => {


                    var esetguid = odata.results[0].SAP_UUID;

                    var editpayload = {
                        ID: "1",
                        Status: "12"
                       
                    };                    

                    var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                    delapi.update(esetwithguid, editpayload, {
                        success: (odata) => {                                
                            this._getwipprojectdata();                             
                            this.byId("wiptable").removeSelections();                         
                            this.selflag = 0;
                        },
                        error: (err) => {
                            MessageToast.show(err);                             
                            this.byId("wiptable").removeSelections();                         
                            this.selflag = 0;
                        }
                    });
                },
                error: (err) => {
                    this.byId("wiptable").removeSelections();                         
                    this.selflag = 0;
                }


            });

        },
        _multiDeleteOriginal : function(multiaccdoc){
            var delapi = this.getOwnerComponent().getModel("wipeditsMDL");
            var editpayload = {
                JEID: multiaccdoc,
                ID: "1",
                Status: "11",
                ProjectID : this.project,
                Quantity:this.qty,
                WBS: this.wrkpkg,
                Notes: this.notes,
                ActivityType:this.acttype,
                ServiceDate:this.formatter.dateTimebackendwithtime(this.timesheetdate)
              
            };

           
            delapi.create("/YY1_WIPEDITS", editpayload, {
                success: (odata) => {
                   
                    this._getwipprojectdata();
                    this.byId("wiptable").removeSelections();                         
                    this.selflag = 0;
                
                },
                error: (err) => {
                    MessageToast.show(err);
                    this.byId("wiptable").removeSelections();
                    this.selflag = 0;

                }
            });

        },
        _multiDeleteNew : function(multiaccdoc){
            var delapi = this.getOwnerComponent().getModel("wipeditsMDL");
            var filterjeid = new Filter("JEID", FilterOperator.EQ, multiaccdoc);
            delapi.read("/YY1_WIPEDITS", {
                filters: [filterjeid],
                success: (odata) => {


                    var esetguid = odata.results[0].SAP_UUID;

                    var editpayload = {
                        ID: "1",
                        Status: "13"
                       
                    };                    

                    var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                    delapi.update(esetwithguid, editpayload, {
                        success: (odata) => {                                
                            this._getwipprojectdata();    
                            this.byId("wiptable").removeSelections();                         
                            this.selflag = 0;
                        },
                        error: (err) => {
                            MessageToast.show(err);                             
                            this.byId("wiptable").removeSelections();                         
                            this.selflag = 0;
                        
                        }
                    });
                },
                error: (err) => {
                    this.byId("wiptable").removeSelections();                         
                    this.selflag = 0;
                
                }


            });


        },
        _deleteRecord : function(){
            debugger;
            if(this.editflag){
                MessageToast.show("Multi Delete");
                for(var i=0;i<this.multistatus.length;i++){
                    if(this.multistatus[i]==='Updated'){
                        debugger;
                        this._multiDeleteUpdated(this.multiaccdoc[i]);
                    }
                    if(this.multistatus[i]==='Original'){
                        this._multiDeleteOriginal(this.multiaccdoc[i]);
                    }
                    if(this.multistatus[i]==='New'){
                        this._multiDeleteNew(this.multiaccdoc[i]);
                    }
                }
            }
            else {


            var delapi = this.getOwnerComponent().getModel("wipeditsMDL");
            if (this.statustext === 'Original') {

                var editpayload = {
                    JEID: this.accdocjeid,
                    ID: "1",
                    Status: "11",
                    ProjectID : this.project,
                    Quantity:this.qty,
                    WBS: this.wrkpkg,
                    Notes: this.notes,
                    ActivityType:this.acttype,
                    ServiceDate:this.formatter.dateTimebackendwithtime(this.timesheetdate)
                  
                };

               
                delapi.create("/YY1_WIPEDITS", editpayload, {
                    success: (odata) => {
                       
                        this._getwipprojectdata();
                        this.byId("wiptable").removeSelections();
                        this.selflag = 0;

                    },
                    error: (err) => {
                        MessageToast.show(err);
                        this.byId("wiptable").removeSelections();
                        this.selflag = 0;

                    }
                });
            }
            if (this.statustext === 'Updated' ) {

               // var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID", FilterOperator.EQ, this.accdocjeid)
                delapi.read("/YY1_WIPEDITS", {
                    filters: [filterjeid],
                    success: (odata) => {


                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            ID: "1",
                            Status: "12"
                           
                        };                    

                        var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                        delapi.update(esetwithguid, editpayload, {
                            success: (odata) => {                                
                                this._getwipprojectdata();                             
                                this.selflag = 0;
                            },
                            error: (err) => {
                                MessageToast.show(err);                             
                                this.byId("wiptable").removeSelections();
                                this.selflag = 0;
                            }
                        });
                    },
                    error: (err) => {
                        this.byId("wiptable").removeSelections();
                        this.selflag = 0;
                    }


                });
            }
              if (this.statustext === 'New' ) {

               // var editapi = this.getOwnerComponent().getModel("wipeditsMDL");
                var filterjeid = new Filter("JEID", FilterOperator.EQ, this.accdocjeid)
                delapi.read("/YY1_WIPEDITS", {
                    filters: [filterjeid],
                    success: (odata) => {


                        var esetguid = odata.results[0].SAP_UUID;

                        var editpayload = {
                            ID: "1",
                            Status: "13"
                           
                        };                    

                        var esetwithguid = "/YY1_WIPEDITS(guid'" + esetguid + "')";
                        delapi.update(esetwithguid, editpayload, {
                            success: (odata) => {                                
                                this._getwipprojectdata();   
                                this.selflag = 0;                          

                            },
                            error: (err) => {
                                MessageToast.show(err);                             
                                this.byId("wiptable").removeSelections();
                                this.selflag = 0;
                            }
                        });
                    },
                    error: (err) => {
                        this.byId("wiptable").removeSelections();
                        this.selflag = 0;
                    }


                });
            }
        }

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
            this._bindView("/ProjectSet" + sObjectId);
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
                sObjectName = oObject.ProjectSet;

            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
