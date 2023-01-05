import { DirectoryManager, DmFileReader } from "./DirectoryManagers";
import { BrowserDmFileReader } from "./BrowserDirectoryManagers";
export declare class SafariDirectoryManager implements DirectoryManager {
    path: string;
    files: File[];
    name: string;
    constructor(path: string, files: File[]);
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager | undefined>;
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
