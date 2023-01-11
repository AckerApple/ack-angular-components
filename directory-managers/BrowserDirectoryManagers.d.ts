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
    readAsDataURL(): Promise<string>;
}
export declare class BrowserDirectoryManager implements DirectoryManager {
    path: string;
    files: FileSystemFileHandle[];
    directoryHandler: FileSystemDirectoryHandle;
    name: string;
    constructor(path: string, files: FileSystemFileHandle[], // LikeFile[],
    directoryHandler: FileSystemDirectoryHandle);
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager | undefined>;
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<BrowserDirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    createDirectory(newPath: string): Promise<BrowserDirectoryManager>;
    getDirectory(newPath: string, options?: FileSystemGetDirectoryOptions): Promise<BrowserDirectoryManager>;
    removeEntry(name: string, options?: {
        recursive: boolean;
    }): Promise<void>;
    renameFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    file(fileName: string, options?: FileSystemGetFileOptions): Promise<BrowserDmFileReader>;
    findFileByPath(path: string, directoryHandler?: any): Promise<BrowserDmFileReader | undefined>;
}
