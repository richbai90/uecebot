"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asConnect = void 0;
var discord_js_1 = require("discord.js");
var app_search_node_1 = __importDefault(require("@elastic/app-search-node"));
function default_1(key, cache) {
    if (!key.description)
        return;
    var bot = new discord_js_1.Client({ ws: { intents: discord_js_1.Intents.ALL } });
    var token = process.env[key.description];
    bot.login(token);
    cache.set(key, bot);
    return bot;
}
exports.default = default_1;
function asConnect() {
    return new app_search_node_1.default(undefined, process.env.ASAPI, function () { return process.env.ASEP; });
}
exports.asConnect = asConnect;
//# sourceMappingURL=connect.js.map