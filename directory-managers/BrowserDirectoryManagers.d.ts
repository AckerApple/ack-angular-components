import { BrowserDmFileReader } from "./BrowserDmFileReader";
import { DirectoryManager } from "./DirectoryManagers";
import { DmFileReader } from "./DmFileReader";
export declare class BrowserDirectoryManager implements DirectoryManager {
    path: string;
    files: FileSystemFileHandle[];
    directoryHandler: FileSystemDirectoryHandle;
    name: string;
    constructor(path: string, files: FileSystemFileHandle[], // LikeFile[],
    directoryHandler: FileSystemDirectoryHandle);
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<BrowserDirectoryManager | undefined>;
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<DirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    createDirectory(newPath: string): Promise<DirectoryManager>;
    getDirectory(newPath: string, options?: FileSystemGetDirectoryOptions): Promise<BrowserDirectoryManager>;
    removeEntry(name: string, options?: {
        recursive: boolean;
    }): Promise<void>;
    renameFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    copyFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    file(path: string, options?: FileSystemGetFileOptions): Promise<DmFileReader>;
    findFileByPath(path: string, directoryHandler?: any): Promise<BrowserDmFileReader | undefined>;
}
