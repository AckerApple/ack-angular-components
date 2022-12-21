import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers";
export declare class BrowserDmFileReader extends BaseDmFileReader implements DmFileReader {
    file: File | FileSystemFileHandle;
    directory: DirectoryManager;
    name: string;
    constructor(file: File | FileSystemFileHandle, directory: DirectoryManager);
    stats(): Promise<File>;
    write(fileString: string): Promise<void>;
    private getRealFile;
    readAsText(): Promise<string>;
}
export declare class BrowserDirectoryManager implements DirectoryManager {
    path: string;
    files: FileSystemFileHandle[];
    directoryHandler: FileSystemDirectoryHandle;
    name: string;
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
export declare function getNameByPath(path: string): string;
