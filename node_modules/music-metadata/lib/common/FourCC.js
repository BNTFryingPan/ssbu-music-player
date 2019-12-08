"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
const validFourCC = /^[\w-©][\w-\x000-3]/;
/**
 * Token for read FourCC
 * Ref: https://en.wikipedia.org/wiki/FourCC
 */
exports.FourCcToken = {
    len: 4,
    get: (buf, off) => {
        const id = buf.toString("binary", off, off + exports.FourCcToken.len);
        if (!id.match(validFourCC)) {
            throw new Error(`FourCC contains invalid characters: ${Util_1.default.a2hex(id)}`);
        }
        return id;
    },
    put: (buffer, offset, id) => {
        const str = Buffer.from(id, 'binary');
        if (str.length !== 4)
            throw new Error("Invalid length");
        return str.copy(buffer, offset);
    }
};
//# sourceMappingURL=FourCC.js.map