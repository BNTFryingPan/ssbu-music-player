"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initDebug = require("debug");
const Token = require("token-types");
const Util_1 = require("../common/Util");
const ID3v2Token_1 = require("./ID3v2Token");
const debug = initDebug('music-metadata:id3v2:frame-parser');
const defaultEnc = 'iso-8859-1';
class FrameParser {
    static readData(b, type, major, includeCovers) {
        const { encoding, bom } = ID3v2Token_1.TextEncodingToken.get(b, 0);
        const length = b.length;
        let offset = 0;
        let output = []; // ToDo
        const nullTerminatorLength = FrameParser.getNullTerminatorLength(encoding);
        let fzero;
        const out = {};
        debug(`Parsing tag type=${type}, encoding=${encoding}, bom=${bom}`);
        switch (type !== 'TXXX' && type[0] === 'T' ? 'T*' : type) {
            case 'T*': // 4.2.1. Text information frames - details
            case 'IPLS': // v2.3: Involved people list
                const text = Util_1.default.decodeString(b.slice(1), encoding).replace(/\x00+$/, '');
                switch (type) {
                    case 'TMCL': // Musician credits list
                    case 'TIPL': // Involved people list
                    case 'IPLS': // Involved people list
                        output = FrameParser.splitValue(4, text);
                        output = FrameParser.functionList(output);
                        break;
                    case 'TRK':
                    case 'TRCK':
                    case 'TPOS':
                        output = text;
                        break;
                    case 'TCOM':
                    case 'TEXT':
                    case 'TOLY':
                    case 'TOPE':
                    case 'TPE1':
                    case 'TSRC':
                        // id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
                        output = FrameParser.splitValue(major, text);
                        break;
                    default:
                        output = major >= 4 ? FrameParser.splitValue(major, text) : [text];
                }
                break;
            case 'TXXX':
                output = FrameParser.readIdentifierAndData(b, offset + 1, length, encoding);
                output = {
                    description: output.id,
                    text: FrameParser.splitValue(major, Util_1.default.decodeString(output.data, encoding).replace(/\x00+$/, ''))
                };
                break;
            case 'PIC':
            case 'APIC':
                if (includeCovers) {
                    const pic = {};
                    offset += 1;
                    switch (major) {
                        case 2:
                            pic.format = Util_1.default.decodeString(b.slice(offset, offset + 3), encoding);
                            offset += 3;
                            break;
                        case 3:
                        case 4:
                            fzero = Util_1.default.findZero(b, offset, length, defaultEnc);
                            pic.format = Util_1.default.decodeString(b.slice(offset, fzero), defaultEnc);
                            offset = fzero + 1;
                            break;
                        default:
                            throw new Error('Warning: unexpected major versionIndex: ' + major);
                    }
                    pic.format = FrameParser.fixPictureMimeType(pic.format);
                    pic.type = ID3v2Token_1.AttachedPictureType[b[offset]];
                    offset += 1;
                    fzero = Util_1.default.findZero(b, offset, length, encoding);
                    pic.description = Util_1.default.decodeString(b.slice(offset, fzero), encoding);
                    offset = fzero + nullTerminatorLength;
                    pic.data = Buffer.from(b.slice(offset, length));
                    output = pic;
                }
                break;
            case 'CNT':
            case 'PCNT':
                output = Token.UINT32_BE.get(b, 0);
                break;
            case 'SYLT':
                // skip text encoding (1 byte),
                //      language (3 bytes),
                //      time stamp format (1 byte),
                //      content tagTypes (1 byte),
                //      content descriptor (1 byte)
                offset += 7;
                output = [];
                while (offset < length) {
                    const txt = b.slice(offset, offset = Util_1.default.findZero(b, offset, length, encoding));
                    offset += 5; // push offset forward one +  4 byte timestamp
                    output.push(Util_1.default.decodeString(txt, encoding));
                }
                break;
            case 'ULT':
            case 'USLT':
            case 'COM':
            case 'COMM':
                offset += 1;
                out.language = Util_1.default.decodeString(b.slice(offset, offset + 3), defaultEnc);
                offset += 3;
                fzero = Util_1.default.findZero(b, offset, length, encoding);
                out.description = Util_1.default.decodeString(b.slice(offset, fzero), encoding);
                offset = fzero + nullTerminatorLength;
                out.text = Util_1.default.decodeString(b.slice(offset, length), encoding).replace(/\x00+$/, '');
                output = [out];
                break;
            case 'UFID':
                output = FrameParser.readIdentifierAndData(b, offset, length, defaultEnc);
                output = { owner_identifier: output.id, identifier: output.data };
                break;
            case 'PRIV': // private frame
                output = FrameParser.readIdentifierAndData(b, offset, length, defaultEnc);
                output = { owner_identifier: output.id, data: output.data };
                break;
            case 'POPM': // Popularimeter
                fzero = Util_1.default.findZero(b, offset, length, defaultEnc);
                const email = Util_1.default.decodeString(b.slice(offset, fzero), defaultEnc);
                offset = fzero + 1;
                const dataLen = length - offset;
                output = {
                    email,
                    rating: b.readUInt8(offset),
                    counter: dataLen >= 5 ? b.readUInt32BE(offset + 1) : undefined
                };
                break;
            case 'GEOB': { // General encapsulated object
                fzero = Util_1.default.findZero(b, offset + 1, length, encoding);
                const mimeType = Util_1.default.decodeString(b.slice(offset + 1, fzero), defaultEnc);
                offset = fzero + 1;
                fzero = Util_1.default.findZero(b, offset, length - offset, encoding);
                const filename = Util_1.default.decodeString(b.slice(offset + 1, fzero), defaultEnc);
                offset = fzero + 1;
                fzero = Util_1.default.findZero(b, offset, length - offset, encoding);
                const description = Util_1.default.decodeString(b.slice(offset + 1, fzero), defaultEnc);
                output = {
                    type: mimeType,
                    filename,
                    description,
                    data: b.slice(offset + 1, length)
                };
                break;
            }
            // W-Frames:
            case 'WCOM':
            case 'WCOP':
            case 'WOAF':
            case 'WOAR':
            case 'WOAS':
            case 'WORS':
            case 'WPAY':
            case 'WPUB':
                // Decode URL
                output = Util_1.default.decodeString(b.slice(offset, fzero), encoding);
                break;
            case 'WXXX': {
                // Decode URL
                fzero = Util_1.default.findZero(b, offset + 1, length, encoding);
                const description = Util_1.default.decodeString(b.slice(offset + 1, fzero), defaultEnc);
                offset = fzero + 1;
                output = { description, url: Util_1.default.decodeString(b.slice(offset, length - offset), encoding) };
                break;
            }
            case 'MCDI': {
                // Music CD identifier
                output = b.slice(0, length);
                break;
            }
            default:
                debug('Warning: unsupported id3v2-tag-type: ' + type);
                break;
        }
        return output;
    }
    static fixPictureMimeType(pictureType) {
        pictureType = pictureType.toLocaleLowerCase();
        switch (pictureType) {
            case 'jpg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
        }
        return pictureType;
    }
    /**
     * Converts TMCL (Musician credits list) or TIPL (Involved people list)
     * @param entries
     */
    static functionList(entries) {
        const res = {};
        for (let i = 0; i + 1 < entries.length; i += 2) {
            const names = entries[i + 1].split(',');
            res[entries[i]] = res.hasOwnProperty(entries[i]) ? res[entries[i]].concat(names) : names;
        }
        return res;
    }
    /**
     * id3v2.4 defines that multiple T* values are separated by 0x00
     * id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
     * @param {number} major Major version, e.g. (4) for  id3v2.4
     * @param {string} text Concatenated tag value
     * @returns {string[]} Slitted value
     */
    static splitValue(major, text) {
        const values = text.split(major >= 4 ? /\x00/g : /\//g);
        return FrameParser.trimArray(values);
    }
    static trimArray(values) {
        for (let i = 0; i < values.length; ++i) {
            values[i] = values[i].replace(/\x00+$/, '').trim();
        }
        return values;
    }
    static readIdentifierAndData(b, offset, length, encoding) {
        const fzero = Util_1.default.findZero(b, offset, length, encoding);
        const id = Util_1.default.decodeString(b.slice(offset, fzero), encoding);
        offset = fzero + FrameParser.getNullTerminatorLength(encoding);
        return { id, data: b.slice(offset, length) };
    }
    static getNullTerminatorLength(enc) {
        return enc === 'utf16' ? 2 : 1;
    }
}
exports.default = FrameParser;
//# sourceMappingURL=FrameParser.js.map