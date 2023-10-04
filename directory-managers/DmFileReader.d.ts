import { DirectoryManager, FileStats } from "./DirectoryManagers";
export interface StreamStats {
    offset: number;
    percent: number;
    isLast: boolean;
    stop: () => unknown;
    cancel: () => unknown;
}
export declare type streamCallback = (string: string, stats: StreamStats) => any;
export interface DmFileReader {
    directory: DirectoryManager;
    name: string;
    write: (fileString: string | ArrayBuffer) => Promise<void>;
    readWriteTextStream: (callback: streamCallback, chunkSize?: number) => Promise<void>;
    readAsText: () => Promise<string>;
    readTextStream: (callback: streamCallback, chunkSize?: number) => Promise<void>;
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
