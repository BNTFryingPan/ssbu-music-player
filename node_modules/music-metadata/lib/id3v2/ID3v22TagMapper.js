"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenericTagMapper_1 = require("../common/GenericTagMapper");
/**
 * ID3v2.2 tag mappings
 */
exports.id3v22TagMap = {
    TT2: 'title',
    TP1: 'artist',
    TP2: 'albumartist',
    TAL: 'album',
    TYE: 'year',
    COM: 'comment',
    TRK: 'track',
    TPA: 'disk',
    TCO: 'genre',
    PIC: 'picture',
    TCM: 'composer',
    TOR: 'originaldate',
    TOT: 'work',
    TXT: 'lyricist',
    TP3: 'conductor',
    TPB: 'label',
    TT1: 'grouping',
    TT3: 'subtitle',
    TLA: 'language',
    TCR: 'copyright',
    WCP: 'license',
    TEN: 'encodedby',
    TSS: 'encodersettings',
    WAR: 'website',
    'COM:iTunPGAP': 'gapless'
    /* ToDo: iTunes tags:
    'COM:iTunNORM': ,
    'COM:iTunSMPB': 'encoder delay',
    'COM:iTunes_CDDB_IDs'
    */
};
class ID3v22TagMapper extends GenericTagMapper_1.CommonTagMapper {
    constructor() {
        super(['ID3v2.2'], exports.id3v22TagMap);
    }
}
exports.ID3v22TagMapper = ID3v22TagMapper;
//# sourceMappingURL=ID3v22TagMapper.js.map