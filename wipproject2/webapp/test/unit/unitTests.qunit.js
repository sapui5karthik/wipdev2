/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/chappota/wippoc2/wipproject2/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});