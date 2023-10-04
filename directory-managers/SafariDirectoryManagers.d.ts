import { DirectoryManager } from "./DirectoryManagers";
import { DmFileReader } from "./DmFileReader";
import { BrowserDmFileReader } from "./BrowserDmFileReader";
export declare class SafariDirectoryManager implements DirectoryManager {
    path: string;
    files: File[];
    name: string;
    constructor(path: string, files: File[]);
    copyFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    renameFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    /** ⚠️ does not actually work */
    removeEntry(_name: string, _options?: {
        recursive: boolean;
    }): Promise<void>;
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager | undefined>;
    /** ⚠️ does not actually work */
    createDirectory(newPath: string): Promise<SafariDirectoryManager>;
    getDirectory(path: string): Promise<SafariDirectoryManager>;
    getRelativeItems(): File[];
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<SafariDirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    findFileByPath(filePath: string): Promise<BrowserDmFileReader | undefined>;
    file(fileName: string, _options?: FileSystemGetFileOptions): Promise<BrowserDmFileReader>;
}
