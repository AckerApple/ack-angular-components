import { DmFileReader, streamCallback, StreamStats } from "./DmFileReader";
/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file */
export declare function readFileStream(file: File, chunkSize?: number, // 1MB,
eachString?: streamCallback): Promise<void>;
export declare function readWriteFile(file: DmFileReader, fileHandle: FileSystemFileHandle, transformFn: (chunk: string, stats: StreamStats) => string, // aka callback
chunkSize?: number): Promise<void>;
