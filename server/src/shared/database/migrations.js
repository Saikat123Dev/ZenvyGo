"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
var fs = require("fs");
var path = require("path");
var mysql = require("mysql2/promise");
var env_1 = require("../config/env");
var logger_1 = require("../utils/logger");
var logger = (0, logger_1.createChildLogger)({ scope: 'migrations' });
var migrationsDir = path.resolve(process.cwd(), 'migrations');
function ensureMigrationsTable(connection) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.query("\n    CREATE TABLE IF NOT EXISTS _migrations (\n      id INT AUTO_INCREMENT PRIMARY KEY,\n      name VARCHAR(255) NOT NULL UNIQUE,\n      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n    )\n  ")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getConnection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, mysql.createConnection({
                    host: env_1.env.DB_HOST,
                    port: env_1.env.DB_PORT,
                    database: env_1.env.DB_NAME,
                    user: env_1.env.DB_USER,
                    password: env_1.env.DB_PASSWORD,
                    multipleStatements: true,
                })];
        });
    });
}
function runUp(connection) {
    return __awaiter(this, void 0, void 0, function () {
        var files, appliedRows, applied, _i, files_1, file, sql, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = fs
                        .readdirSync(migrationsDir)
                        .filter(function (file) { return file.endsWith('.up.sql'); })
                        .sort();
                    return [4 /*yield*/, connection.query('SELECT name FROM _migrations ORDER BY id ASC')];
                case 1:
                    appliedRows = (_a.sent())[0];
                    applied = new Set(appliedRows.map(function (row) { return String(row.name); }));
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 11];
                    file = files_1[_i];
                    if (applied.has(file)) {
                        return [3 /*break*/, 10];
                    }
                    sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
                    return [4 /*yield*/, connection.beginTransaction()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 8, , 10]);
                    return [4 /*yield*/, connection.query(sql)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, connection.query('INSERT INTO _migrations (name) VALUES (?)', [file])];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, connection.commit()];
                case 7:
                    _a.sent();
                    logger.info('Applied migration', { name: file });
                    return [3 /*break*/, 10];
                case 8:
                    error_1 = _a.sent();
                    return [4 /*yield*/, connection.rollback()];
                case 9:
                    _a.sent();
                    throw error_1;
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function runDown(connection) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, latest, downFile, downPath, sql, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, connection.query('SELECT name FROM _migrations ORDER BY id DESC LIMIT 1')];
                case 1:
                    rows = (_b.sent())[0];
                    latest = ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.name) ? String(rows[0].name) : null;
                    if (!latest) {
                        logger.info('No applied migrations found');
                        return [2 /*return*/];
                    }
                    downFile = latest.replace('.up.sql', '.down.sql');
                    downPath = path.join(migrationsDir, downFile);
                    if (!fs.existsSync(downPath)) {
                        throw new Error("Missing down migration for ".concat(latest));
                    }
                    sql = fs.readFileSync(downPath, 'utf-8');
                    return [4 /*yield*/, connection.beginTransaction()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 7, , 9]);
                    return [4 /*yield*/, connection.query(sql)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, connection.query('DELETE FROM _migrations WHERE name = ?', [latest])];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, connection.commit()];
                case 6:
                    _b.sent();
                    logger.info('Rolled back migration', { name: latest });
                    return [3 /*break*/, 9];
                case 7:
                    error_2 = _b.sent();
                    return [4 /*yield*/, connection.rollback()];
                case 8:
                    _b.sent();
                    throw error_2;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function runMigrations() {
    return __awaiter(this, arguments, void 0, function (direction) {
        var connection;
        if (direction === void 0) { direction = 'up'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getConnection()];
                case 1:
                    connection = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 9, 11]);
                    return [4 /*yield*/, ensureMigrationsTable(connection)];
                case 3:
                    _a.sent();
                    if (!(direction === 'up')) return [3 /*break*/, 5];
                    return [4 /*yield*/, runUp(connection)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 5:
                    if (!(direction === 'down')) return [3 /*break*/, 7];
                    return [4 /*yield*/, runDown(connection)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7: throw new Error("Unsupported migration direction: ".concat(direction));
                case 8: return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, connection.end()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
