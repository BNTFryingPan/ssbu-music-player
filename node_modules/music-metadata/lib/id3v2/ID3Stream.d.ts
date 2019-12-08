/// <reference types="node" />
import { Readable } from "stream";
/**
 * Utility to convert stream to buffer
 */
export declare class ID3Stream extends Readable {
    private buf;
    constructor(buf: Buffer);
    _read(): void;
}
