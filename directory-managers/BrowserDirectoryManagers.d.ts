import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers";
export declare class BrowserDmFileReader extends BaseDmFileReader implements DmFileReader {
    file: File | FileSystemFileHandle;
    directory: DirectoryManager;
    name: string;
    constructor(file: File | FileSystemFileHandle, directory: DirectoryManager);
    write(fileString: string): Promise<void>;
    private getReadFile;
    readAsText(): Promise<string>;
}
export declare class BrowserDirectoryManager implements DirectoryManager {
    path: string;
    files: FileSystemFileHandle[];
    directoryHandler: FileSystemDirectoryHandle;
    constructor(path: string, files: FileSystemFileHandle[], // LikeFile[],
    directoryHandler: FileSystemDirectoryHandle);
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<BrowserDirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    getDirectory(newPath: string, options?: FileSystemGetDirectoryOptions): Promise<BrowserDirectoryManager>;
    file(fileName: string, options?: FileSystemGetFileOptions): Promise<BrowserDmFileReader>;
    findFileByPath(path: string, directoryHandler?: any): Promise<BrowserDmFileReader | undefined>;
}
