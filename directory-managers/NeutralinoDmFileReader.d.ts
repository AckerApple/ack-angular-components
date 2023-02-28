import { FileStats } from "./DirectoryManagers";
import { BaseDmFileReader, DmFileReader, streamCallback } from "./DmFileReader";
import { NeutralinoDirectoryManager } from "./NeutralinoDirectoryManager";
export declare class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
    filePath: string;
    directory: NeutralinoDirectoryManager;
    name: string;
    constructor(filePath: string, directory: NeutralinoDirectoryManager);
    readTextStream(callback: streamCallback, chunkSize?: number): Promise<void>;
    stats(): Promise<FileStats>;
    readAsText(): Promise<string>;
    readAsDataURL(): Promise<string>;
    /**
     * 1. Creates a file of a similar name and reads from source file
     * 2. Writes to created via append commands
     * 3. The original file is renamed on stream end
     * 4. The new file is named to the original and then original file is then deleted */
    readWriteTextStream(callback: streamCallback, chunkSize?: number): Promise<void>;
    write(fileString: string | ArrayBuffer): Promise<any>;
}
