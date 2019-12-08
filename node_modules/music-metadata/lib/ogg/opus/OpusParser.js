"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const Opus = require("./Opus");
const VorbisParser_1 = require("../vorbis/VorbisParser");
/**
 * Opus parser
 * Internet Engineering Task Force (IETF) - RFC 6716
 * Used by OggParser
 */
class OpusParser extends VorbisParser_1.VorbisParser {
    constructor(metadata, options, tokenizer) {
        super(metadata, options);
        this.tokenizer = tokenizer;
        this.lastPos = -1;
    }
    /**
     * Parse first Opus Ogg page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    parseFirstPage(header, pageData) {
        this.metadata.setFormat('codec', 'Opus');
        // Parse Opus ID Header
        this.idHeader = new Opus.IdHeader(pageData.length).get(pageData, 0);
        if (this.idHeader.magicSignature !== "OpusHead")
            throw new Error("Illegal ogg/Opus magic-signature");
        this.metadata.setFormat('sampleRate', this.idHeader.inputSampleRate);
        this.metadata.setFormat('numberOfChannels', this.idHeader.channelCount);
    }
    parseFullPage(pageData) {
        const magicSignature = new Token.StringType(8, 'ascii').get(pageData, 0);
        switch (magicSignature) {
            case 'OpusTags':
                this.parseUserCommentList(pageData, 8);
                this.lastPos = this.tokenizer.position;
                break;
            default:
                break;
        }
    }
    calculateDuration(header) {
        if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
            // Calculate duration
            this.metadata.setFormat('numberOfSamples', header.absoluteGranulePosition - this.idHeader.preSkip);
            this.metadata.setFormat('duration', this.metadata.format.numberOfSamples / this.idHeader.inputSampleRate);
            if (this.lastPos !== -1 && this.tokenizer.fileSize && this.metadata.format.duration) {
                const dataSize = this.tokenizer.fileSize - this.lastPos;
                this.metadata.setFormat('bitrate', 8 * dataSize / this.metadata.format.duration);
            }
        }
    }
}
exports.OpusParser = OpusParser;
//# sourceMappingURL=OpusParser.js.map