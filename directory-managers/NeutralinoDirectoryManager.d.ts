import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers";
export declare class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
    filePath: string;
    directory: NeutralinoDirectoryManager;
    name: string;
    constructor(filePath: string, directory: NeutralinoDirectoryManager);
    stats(): Promise<any>;
    readAsText(): Promise<string>;
    readAsDataURL(): Promise<string>;
    write(fileString: string): Promise<any>;
}
export declare class NeutralinoDirectoryManager implements DirectoryManager {
    path: string;
    name: string;
    constructor(path: string);
    findDirectory(path: string, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager | undefined>;
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFolders(): Promise<NeutralinoDirectoryManager[]>;
    getFiles(): Promise<DmFileReader[]>;
    createDirectory(newPath: string): Promise<DirectoryManager>;
    getDirectory(newPath: string): Promise<NeutralinoDirectoryManager>;
    findFileByPath(filePath: string): Promise<NeutralinoDmFileReader>;
    file(fileName: string, _options?: FileSystemGetFileOptions): Promise<NeutralinoDmFileReader>;
    getFullPath(itemPath: string): string;
    renameFile(oldFileName: string, newFileName: string): Promise<DmFileReader>;
    removeEntry(name: string): Promise<void>;
}
