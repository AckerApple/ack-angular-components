export interface DirectoryManager {
    name: string;
    path: string;
    createDirectory: (path: string) => Promise<DirectoryManager>;
    getDirectory: (path: string, options?: FileSystemGetDirectoryOptions) => Promise<DirectoryManager>;
    findDirectory: (path: string, options?: FileSystemGetDirectoryOptions) => Promise<DirectoryManager | undefined>;
    list: () => Promise<string[]>;
    listFiles: () => Promise<string[]>;
    listFolders: () => Promise<string[]>;
    getFolders: () => Promise<DirectoryManager[]>;
    getFiles: () => Promise<DmFileReader[]>;
    findFileByPath: (path: string) => Promise<DmFileReader | undefined>;
    file: (fileName: string, options?: FileSystemGetFileOptions) => Promise<DmFileReader>;
    renameFile: (oldFileName: string, newfileName: string, options?: FileSystemGetFileOptions) => Promise<DmFileReader>;
    removeEntry: (name: string, options?: {
        recursive: boolean;
    }) => Promise<void>;
}
export interface FileStats {
    lastModified: number;
    lastModifiedDate?: Date;
    name: string;
    size: number;
    type: string;
}
export interface DmFileReader {
    directory: DirectoryManager;
    name: string;
    write: (fileString: string | ArrayBuffer) => Promise<void>;
    readAsText: () => Promise<string>;
    readAsJson: () => Promise<Object>;
    readAsDataURL: () => Promise<string>;
    readAsXml: () => Promise<Document>;
    readXmlFirstElementByTagName: (tagName: string) => Promise<Element | undefined>;
    readXmlElementsByTagName: (tagName: string) => Promise<Element[]>;
    readXmlFirstElementContentByTagName: (tagName: string) => Promise<string | null | undefined>;
    stats: () => Promise<FileStats>;
}
export declare class BaseDmFileReader {
    readXmlFirstElementContentByTagName(tagName: string): Promise<string | null | undefined>;
    readXmlElementsByTagName(tagName: string): Promise<Element[]>;
    readXmlFirstElementByTagName(tagName: string): Promise<Element | undefined>;
    readAsXml(): Promise<Document>;
    readAsJson(): Promise<string>;
    readAsText(): Promise<string>;
}
export declare function getNameByPath(path: string): string;
export declare function findDirectoryWithin(path: string, inDir: DirectoryManager, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager | undefined>;
export declare function renameFileInDir(oldFileName: string, newFileName: string, dir: DirectoryManager): Promise<DmFileReader>;
export declare function getDirForFilePath(path: string, fromDir: DirectoryManager, options?: FileSystemGetDirectoryOptions): Promise<DirectoryManager>;
