import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers";
export declare class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
    filePath: string;
    directory: NeutralinoDirectoryManager;
    name: string;
    constructor(filePath: string, directory: NeutralinoDirectoryManager);
    stats(): Promise<any>;
    readAsText(): Promise<string>;
    readAsDataURL(): Promise<string>;
    write(fileString: string | ArrayBuffer): Promise<any>;
}
export declare class NeutralinoDirectoryManager implements DirectoryManager {
    path: string;
    name: string;
    constructor(path: string);
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<NeutralinoDirectoryManager | undefined>;
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<NeutralinoDirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    createDirectory(newPath: string): Promise<NeutralinoDirectoryManager>;
    getDirectory(newPath: string, options?: FileSystemGetDirectoryOptions): Promise<NeutralinoDirectoryManager>;
    findFileByPath(path: string): Promise<NeutralinoDmFileReader | undefined>;
    file(pathTo: string, options?: FileSystemGetFileOptions): Promise<NeutralinoDmFileReader>;
    getFullPath(itemPath: string): string;
    renameFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    removeEntry(name: string, options?: {
        recursive: boolean;
    }): Promise<void>;
}
