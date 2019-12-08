"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Utility to convert stream to buffer
 */
class ID3Stream extends stream_1.Readable {
    constructor(buf) {
        super();
        this.buf = buf;
    }
    _read() {
        this.push(this.buf);
        this.push(null); // push the EOF-signaling `null` chunk
    }
}
exports.ID3Stream = ID3Stream;
//# sourceMappingURL=ID3Stream.js.map