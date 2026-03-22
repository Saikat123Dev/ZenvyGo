"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var migrations_1 = require("../src/shared/database/migrations");
var direction = ((_a = process.argv[2]) !== null && _a !== void 0 ? _a : 'up');
(0, migrations_1.runMigrations)(direction).catch(function (error) {
    console.error(error);
    process.exit(1);
});
