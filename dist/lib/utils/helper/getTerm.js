"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTermName = exports.getTermId = void 0;
function getTermId() {
    var date = new Date();
    if (date.getMonth() <= 5) {
        return 1214;
    }
    else if (date.getMonth() >= 7) {
        return 1218;
    }
    else {
        return 1216;
    }
}
exports.getTermId = getTermId;
function getTermName(id) {
    switch (id) {
        case 1214:
            return 'spring';
        case 1218:
            return 'fall';
        default:
            return 'summer';
    }
}
exports.getTermName = getTermName;
//# sourceMappingURL=getTerm.js.map