import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers";
export declare class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
    filePath: string;
    directory: NeutralinoDirectoryManager;
    name: string;
    constructor(filePath: string, directory: NeutralinoDirectoryManager);
    readAsText(): Promise<string>;
    write(fileString: string): Promise<any>;
}
export declare class NeutralinoDirectoryManager implements DirectoryManager {
    path: string;
    constructor(path: string);
    list(): Promise<string[]>;
    listFolders(): Promise<string[]>;
    listFiles(): Promise<string[]>;
    getFiles(): Promise<DmFileReader[]>;
    getDirectory(newPath: string): Promise<NeutralinoDirectoryManager>;
    findFileByPath(filePath: string): Promise<NeutralinoDmFileReader>;
    file(fileName: string, _options?: FileSystemGetFileOptions): Promise<NeutralinoDmFileReader>;
    getFullPath(itemPath: string): string;
}
