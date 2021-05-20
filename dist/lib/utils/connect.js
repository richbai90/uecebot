"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
function default_1(key, cache) {
    if (!key.description)
        return;
    var bot = new discord_js_1.Client();
    var token = process.env[key.description];
    bot.login(token);
    cache.set(key, bot);
    return bot;
}
exports.default = default_1;
//# sourceMappingURL=connect.js.map