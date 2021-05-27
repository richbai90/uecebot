"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup_semester = exports.enroll = exports.drop = exports.declare = void 0;
// TODO: Add the commands and exports
var declare_1 = require("./declare");
Object.defineProperty(exports, "declare", { enumerable: true, get: function () { return __importDefault(declare_1).default; } });
var drop_1 = require("./drop");
Object.defineProperty(exports, "drop", { enumerable: true, get: function () { return __importDefault(drop_1).default; } });
var enroll_1 = require("./enroll");
Object.defineProperty(exports, "enroll", { enumerable: true, get: function () { return __importDefault(enroll_1).default; } });
var cleanup_1 = require("./cleanup");
Object.defineProperty(exports, "cleanup_semester", { enumerable: true, get: function () { return __importDefault(cleanup_1).default; } });
//# sourceMappingURL=index.js.map