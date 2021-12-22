"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var console_1 = require("console");
var courseOverlaps_1 = __importStar(require("../../utils/helper/courseOverlaps"));
var createChannels_1 = __importDefault(require("../../utils/helper/createChannels"));
var command = {
    name: '!enroll',
    description: 'Enroll in a class',
    exec: function (msg, msgText) {
        var e_1, _a;
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var overlaps, classes, roles, member, skipped, creatingRoles_1, newChannels, _d, newChannels_1, newChannels_1_1, channel, e_1_1;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        overlaps = false;
                        classes = msgText.split(',');
                        return [4 /*yield*/, ((_b = msg.guild) === null || _b === void 0 ? void 0 : _b.roles.fetch())];
                    case 1:
                        roles = _e.sent();
                        member = msg.member;
                        (0, console_1.assert)(roles && member);
                        return [4 /*yield*/, classes.reduce(function (s, c) { return __awaiter(_this, void 0, void 0, function () {
                                var role;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // don't allow roles other than ece/cs roles to be added
                                            c = c.toLowerCase().replace(/\s*/g, '');
                                            if (c.split(/ece|cs|math/).length < 2) {
                                                s.then(function (a) { return a.push(c); });
                                                return [2 /*return*/, s];
                                            }
                                            role = roles.find(function (r) { return c === r.name.toLowerCase().replace(/\s*/g, ''); });
                                            if (!role) return [3 /*break*/, 2];
                                            return [4 /*yield*/, member.roles.add(role)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 2: return [4 /*yield*/, (0, courseOverlaps_1.default)(c)];
                                        case 3:
                                            if (!((overlaps = _a.sent()) &&
                                                (role = roles.find(function (r) { return changeDepartment(c) === r.name.toLowerCase().replace(/\s*/g, ''); })))) return [3 /*break*/, 5];
                                            return [4 /*yield*/, member.roles.add(role)];
                                        case 4:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 5:
                                            if (overlaps) {
                                                s.then(function (a) {
                                                    a.push("".concat(c, "/").concat(changeDepartment(c)));
                                                });
                                            }
                                            else {
                                                s.then(function (a) { return a.push(c); });
                                            }
                                            _a.label = 6;
                                        case 6: return [2 /*return*/, s];
                                    }
                                });
                            }); }, Promise.resolve([]))];
                    case 2:
                        skipped = _e.sent();
                        if (!(skipped.length > 0)) return [3 /*break*/, 17];
                        creatingRoles_1 = [];
                        skipped = skipped.filter(function (r) { return __awaiter(_this, void 0, void 0, function () {
                            var _r, roleNames, _r_1, _r_1_1, temp, e_2_1, _loop_1, i;
                            var _this = this;
                            var e_2, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        r = r.replace(/(ece|cs)/gi, function (_, $1) {
                                            return $1.toUpperCase() + ' ';
                                        });
                                        if (r.split(/ece|cs|math/i).length < 2)
                                            return [2 /*return*/, true]; // skipping dangerous roles
                                        _r = r.split('/').map(function (__r) { return (0, courseOverlaps_1.getCourse)(__r); });
                                        roleNames = [];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 6, 7, 12]);
                                        _r_1 = __asyncValues(_r);
                                        _b.label = 2;
                                    case 2: return [4 /*yield*/, _r_1.next()];
                                    case 3:
                                        if (!(_r_1_1 = _b.sent(), !_r_1_1.done)) return [3 /*break*/, 5];
                                        temp = _r_1_1.value;
                                        if (!temp)
                                            return [2 /*return*/, true];
                                        roleNames.push(temp);
                                        _b.label = 4;
                                    case 4: return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 12];
                                    case 6:
                                        e_2_1 = _b.sent();
                                        e_2 = { error: e_2_1 };
                                        return [3 /*break*/, 12];
                                    case 7:
                                        _b.trys.push([7, , 10, 11]);
                                        if (!(_r_1_1 && !_r_1_1.done && (_a = _r_1.return))) return [3 /*break*/, 9];
                                        return [4 /*yield*/, _a.call(_r_1)];
                                    case 8:
                                        _b.sent();
                                        _b.label = 9;
                                    case 9: return [3 /*break*/, 11];
                                    case 10:
                                        if (e_2) throw e_2.error;
                                        return [7 /*endfinally*/];
                                    case 11: return [7 /*endfinally*/];
                                    case 12:
                                        _loop_1 = function (i) {
                                            creatingRoles_1.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                                var role;
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0: return [4 /*yield*/, ((_a = msg.guild) === null || _a === void 0 ? void 0 : _a.roles.create({
                                                                name: roleNames[i],
                                                            }))];
                                                        case 1:
                                                            role = _b.sent();
                                                            return [4 /*yield*/, member.roles.add(role.id)];
                                                        case 2:
                                                            _b.sent();
                                                            return [2 /*return*/, role];
                                                    }
                                                });
                                            }); })());
                                        };
                                        for (i = 0; i < roleNames.length; i++) {
                                            _loop_1(i);
                                        }
                                        return [2 /*return*/, false];
                                }
                            });
                        }); });
                        _d = createChannels_1.default;
                        return [4 /*yield*/, Promise.all(creatingRoles_1)];
                    case 3: return [4 /*yield*/, _d.apply(void 0, [_e.sent(), (_c = msg.guild) !== null && _c !== void 0 ? _c : undefined])];
                    case 4:
                        newChannels = _e.sent();
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 10, 11, 16]);
                        newChannels_1 = __asyncValues(newChannels);
                        _e.label = 6;
                    case 6: return [4 /*yield*/, newChannels_1.next()];
                    case 7:
                        if (!(newChannels_1_1 = _e.sent(), !newChannels_1_1.done)) return [3 /*break*/, 9];
                        channel = newChannels_1_1.value;
                        if (channel)
                            msg.channel.send("".concat(member === null || member === void 0 ? void 0 : member.user, ": You have been added to ").concat(channel));
                        _e.label = 8;
                    case 8: return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _e.trys.push([11, , 14, 15]);
                        if (!(newChannels_1_1 && !newChannels_1_1.done && (_a = newChannels_1.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _a.call(newChannels_1)];
                    case 12:
                        _e.sent();
                        _e.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16:
                        if (skipped.length)
                            msg.channel.send("".concat(member === null || member === void 0 ? void 0 : member.user, ": I was unable to find or create the following roles: ").concat(skipped.join(',')));
                        return [3 /*break*/, 18];
                    case 17:
                        msg.channel.send("".concat(member === null || member === void 0 ? void 0 : member.user, ": You have been added to the requested classes."));
                        _e.label = 18;
                    case 18: return [2 /*return*/, true];
                }
            });
        });
    },
};
function changeDepartment(courseName) {
    return courseName.replace(/(ece|cs)/i, function (_match, $1) { return (($1 === null || $1 === void 0 ? void 0 : $1.toLowerCase()) === 'ece' ? 'cs' : 'ece'); });
}
exports.default = command;
//# sourceMappingURL=enroll.js.map