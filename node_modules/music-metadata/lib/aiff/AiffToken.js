"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const assert = require("assert");
const FourCC_1 = require("../common/FourCC");
class Common {
    constructor(header, isAifc) {
        this.isAifc = isAifc;
        const minimumChunkSize = isAifc ? 22 : 18;
        assert.ok(header.chunkSize >= minimumChunkSize, `COMMON CHUNK size should always be at least ${minimumChunkSize}`);
        this.len = header.chunkSize;
    }
    get(buf, off) {
        // see: https://cycling74.com/forums/aiffs-80-bit-sample-rate-value
        const shift = buf.readUInt16BE(off + 8) - 16398;
        const baseSampleRate = buf.readUInt16BE(off + 8 + 2);
        const res = {
            numChannels: buf.readUInt16BE(off),
            numSampleFrames: buf.readUInt32BE(off + 2),
            sampleSize: buf.readUInt16BE(off + 6),
            sampleRate: shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift
        };
        if (this.isAifc) {
            res.compressionType = FourCC_1.FourCcToken.get(buf, off + 18);
            if (this.len > 22) {
                const strLen = buf.readInt8(off + 22);
                const padding = (strLen + 1) % 2;
                if (23 + strLen + padding === this.len) {
                    res.compressionName = new Token.StringType(strLen, 'binary').get(buf, off + 23);
                }
                else {
                    throw new Error('Illegal pstring length');
                }
            }
        }
        else {
            res.compressionName = 'PCM';
        }
        return res;
    }
}
exports.Common = Common;
//# sourceMappingURL=AiffToken.js.map