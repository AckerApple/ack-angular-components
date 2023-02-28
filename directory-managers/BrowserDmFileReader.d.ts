import { BaseDmFileReader, DmFileReader, streamCallback } from "./DmFileReader";
import { DirectoryManager } from "./DirectoryManagers";
export declare class BrowserDmFileReader extends BaseDmFileReader implements DmFileReader {
    file: File | FileSystemFileHandle;
    directory: DirectoryManager;
    name: string;
    constructor(file: File | FileSystemFileHandle, directory: DirectoryManager);
    stats(): Promise<File>;
    readTextStream(callback: streamCallback, chunkSize?: number): Promise<void>;
    readWriteTextStream(callback: streamCallback, chunkSize?: number): Promise<void>;
    write(fileString: string | ArrayBuffer): Promise<void>;
    private getRealFile;
    readAsText(): Promise<string>;
    readAsDataURL(): Promise<string>;
}
