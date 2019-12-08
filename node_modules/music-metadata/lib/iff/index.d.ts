import * as Token from "token-types";
/**
 * "EA IFF 85" Standard for Interchange Format Files
 * Ref: http://www.martinreddy.net/gfx/2d/IFF.txt
 */
export interface IChunkHeader {
    /**
     * 	A chunk ID (ie, 4 ASCII bytes)
     */
    chunkID: string;
    /**
     * Number of data bytes following this data header
     */
    chunkSize: number;
}
/**
 * Common AIFF chunk header
 */
export declare const Header: Token.IGetToken<IChunkHeader>;
