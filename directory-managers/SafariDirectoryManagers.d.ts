import { DirectoryManager, DmFileReader } from "./DirectoryManagers";
import { BrowserDmFileReader } from "./BrowserDirectoryManagers";
export declare class SafariDirectoryManager implements DirectoryManager {
    path: string;
    files: File[];
    constructor(path: string, files: File[]);
    getDirectory(path: string): Promise<SafariDirectoryManager>;
    getRelativeItems(): File[];
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<DmFileReader[]>;
    findFileByPath(filePath: string): Promise<BrowserDmFileReader | undefined>;
    file(fileName: string, _options?: FileSystemGetFileOptions): Promise<BrowserDmFileReader>;
}
