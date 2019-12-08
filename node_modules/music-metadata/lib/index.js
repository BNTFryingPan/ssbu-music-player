"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strtok3 = require("strtok3");
const Core = require("./core");
const ParserFactory_1 = require("./ParserFactory");
const _debug = require("debug");
const RandomFileReader_1 = require("./common/RandomFileReader");
const debug = _debug("music-metadata:parser");
var core_1 = require("./core");
exports.parseFromTokenizer = core_1.parseFromTokenizer;
/**
 * Parse audio from Node Stream.Readable
 * @param {Stream.Readable} stream Stream to read the audio track from
 * @param {string} mimeType Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
async function parseStream(stream, mimeType, options = {}) {
    const tokenizer = await strtok3.fromStream(stream);
    return Core.parseFromTokenizer(tokenizer, mimeType, options);
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node Buffer
 * @param {Stream.Readable} stream Audio input stream
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
exports.parseBuffer = Core.parseBuffer;
/**
 * Parse audio from Node file
 * @param {string} filePath Media file to read meta-data from
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
async function parseFile(filePath, options = {}) {
    debug(`parseFile: ${filePath}`);
    const fileTokenizer = await strtok3.fromFile(filePath);
    const fileReader = new RandomFileReader_1.RandomFileReader(filePath, fileTokenizer.fileSize);
    try {
        await Core.scanAppendingHeaders(fileReader, options);
    }
    finally {
        fileReader.close();
    }
    try {
        const parserName = ParserFactory_1.ParserFactory.getParserIdForExtension(filePath);
        if (!parserName)
            debug(' Parser could not be determined by file extension');
        return await ParserFactory_1.ParserFactory.parse(fileTokenizer, parserName, options);
    }
    finally {
        await fileTokenizer.close();
    }
}
exports.parseFile = parseFile;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param {ITag[]} nativeTags list of tags
 * @returns {INativeTagDict} Tags indexed by id
 */
exports.orderTags = Core.orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param {number} rating Normalized rating [0..1] (common.rating[n].rating)
 * @returns {number} Number of stars: 1, 2, 3, 4 or 5 stars
 */
exports.ratingToStars = Core.ratingToStars;
//# sourceMappingURL=index.js.map