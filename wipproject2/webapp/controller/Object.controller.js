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
        onInit: function () {
            //sap.ui.core.BusyIndicator.hide();
           
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("object").attachPatternMatched(this._getwipprojectdata, this);
           
           
            // promisewiprojlist = new Promise((resolve,reject) => {
            //     wipprojlist.read("/YY1_WIPProjectListAPI1",{
            //         success : (odata) => {
            //             resolve(odata);
            //             debugger;
            //         },
            //         error : (err) => {
            //             reject(err)
            //         }
            //     });
            // });
            // debugger;
            // Promise[(promisewiprojlist)].then((data) => {
            // var wiprojjson = new JSONModel();
            // wiprojjson.setData(data.results);
            // this.getView().setModel(wiprojjson,"prjlst");
            // }).catch(err => {
            //     MessageToast.show(err);
            // });
          
           


        },
        _getwipprojectdata: function (oevent) {
            
            const pid = oevent.getParameter("arguments").pid,
                jrnlentrymdl = this.getOwnerComponent().getModel("jrnlentryMDL"),
                wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL"),
                projectfilter = new Filter("Project", FilterOperator.EQ, pid);

                const wipprojlist = this.getOwnerComponent().getModel(),
                engagementProjectFilter = new Filter("EngagementProject",FilterOperator.EQ,pid);
                wipprojlist.read("/YY1_WIPProjectListAPI1",{
                    filters: [engagementProjectFilter],
                    success : (odata) => {
                        debugger;
                        var wipprojjson = new JSONModel();
                        wipprojjson.setData(odata.results[0]);
                        this.getView().setModel(wipprojjson,"prjlst");
                    },
                    error : (err) => {
                        MessageToast.show(err);
                    }
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

            //var projectfilter = new Filter("Project", FilterOperator.EQ, pid);
            jrnlentrymdl.read("/YY1_JournalEntryItem", {
                filters: [projectfilter],
                success: function (odata) { 
                    // Read 2nd API wipedits
                    
                    //var wipeditsmdl = this.getOwnerComponent().getModel("wipeditsMDL");
                    wipeditsmdl.read("/YY1_WIPEDITS", {
                        success: function (odata2) {
                            var jsonmodelwipedit = new JSONModel();

                            jsonmodelwipedit.setData(odata2.results);

                            var count = new JSONModel();
                            count.setData(odata.results.length);
                            this.getView().setModel(count, "count1");


                            var jsonmodelmainjrnlentry = new JSONModel();
                            jsonmodelmainjrnlentry.setData(odata.results);
                            var changedflag = 0;

                         
                            for (var i = 0; i < odata.results.length; i++) {
                                for(var j=0;j<odata2.results.length;j++){
                                    if (odata.results[i].AccountingDocument === jsonmodelwipedit.oData[j].JEID) {
                                    
                                        odata.results[i].Status = "Changed";
                                        changedflag++;
                                    }
                                }
                                
                            }
                            var changedjson = new JSONModel();
                            changedjson.setData(changedflag);
                            this.getView().setModel(changedjson,"changedcount");

                            var newcount = (odata.results.length)-changedflag;
                            var newjson = new JSONModel();
                            newjson.setData(newcount);
                            this.getView().setModel(newjson,"newcount");

                            this.getView().byId("wiptable").setModel(jsonmodelmainjrnlentry, "wipentry");
                        }.bind(this),
                        error: function (msg2) {}.bind(this)


                    });
                }.bind(this),
                error: function (msg) {}.bind(this)
            });
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
