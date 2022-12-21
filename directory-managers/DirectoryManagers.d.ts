export interface DirectoryManager {
    name: string;
    path: string;
    getDirectory: (path: string, options?: FileSystemGetDirectoryOptions) => Promise<DirectoryManager>;
    list: () => Promise<string[]>;
    listFiles: () => Promise<string[]>;
    listFolders: () => Promise<string[]>;
    getFolders: () => Promise<DirectoryManager[]>;
    getFiles: () => Promise<DmFileReader[]>;
    findFileByPath: (path: string) => Promise<DmFileReader | undefined>;
    file: (fileName: string, options?: FileSystemGetFileOptions) => Promise<DmFileReader>;
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
    write: (fileString: string) => Promise<void>;
    readAsText: () => Promise<string>;
    readAsJson: () => Promise<Object>;
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
