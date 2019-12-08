"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strtok3 = require("strtok3/lib/core");
const ParserFactory_1 = require("./ParserFactory");
const RandomBufferReader_1 = require("./common/RandomBufferReader");
const APEv2Parser_1 = require("./apev2/APEv2Parser");
const ID3v1Parser_1 = require("./id3v1/ID3v1Parser");
const Lyrics3_1 = require("./lyrics3/Lyrics3");
/**
 * Parse audio from Node Stream.Readable
 * @param {Stream.Readable} stream Stream to read the audio track from
 * @param {string} mimeType Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseStream(stream, mimeType, options = {}) {
    return parseFromTokenizer(strtok3.fromStream(stream), mimeType, options);
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node Buffer
 * @param {Stream.Readable} buf Buffer holding audio data
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
async function parseBuffer(buf, mimeType, options = {}) {
    const bufferReader = new RandomBufferReader_1.RandomBufferReader(buf);
    await scanAppendingHeaders(bufferReader, options);
    const tokenizer = strtok3.fromBuffer(buf);
    return parseFromTokenizer(tokenizer, mimeType, options);
}
exports.parseBuffer = parseBuffer;
/**
 * Parse audio from ITokenizer source
 * @param {ITokenizer} tokenizer Audio source implementing the tokenizer interface
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseFromTokenizer(tokenizer, mimeType, options) {
    if (!tokenizer.fileSize && options && options.fileSize) {
        tokenizer.fileSize = options.fileSize;
    }
    return ParserFactory_1.ParserFactory.parseOnContentType(tokenizer, mimeType, options);
}
exports.parseFromTokenizer = parseFromTokenizer;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param nativeTags list of tags
 * @returns tags indexed by id
 */
function orderTags(nativeTags) {
    const tags = {};
    for (const tag of nativeTags) {
        (tags[tag.id] = (tags[tag.id] || [])).push(tag.value);
    }
    return tags;
}
exports.orderTags = orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param {number} rating Normalized rating [0..1] (common.rating[n].rating)
 * @returns {number} Number of stars: 1, 2, 3, 4 or 5 stars
 */
function ratingToStars(rating) {
    return rating === undefined ? 0 : 1 + Math.round(rating * 4);
}
exports.ratingToStars = ratingToStars;
async function scanAppendingHeaders(randomReader, options = {}) {
    let apeOffset = randomReader.fileSize;
    if (await ID3v1Parser_1.hasID3v1Header(randomReader)) {
        apeOffset -= 128;
        const lyricsLen = await Lyrics3_1.getLyricsHeaderLength(randomReader);
        apeOffset -= lyricsLen;
    }
    options.apeOffset = await APEv2Parser_1.APEv2Parser.findApeFooterOffset(randomReader, apeOffset);
}
exports.scanAppendingHeaders = scanAppendingHeaders;
//# sourceMappingURL=core.js.map