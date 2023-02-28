export interface FolderDialogOptions {
    defaultPath?: string;
}
export interface INeutralino {
    filesystem: INeutralinoFs;
    os: {
        showFolderDialog: (title?: string, options?: FolderDialogOptions) => any;
    };
    events: {
        on: (eventName: 'openedFile', callback: (a: any) => any) => any;
        off: (eventName: 'openedFile', callback: (a: any) => any) => any;
    };
}
interface Stats {
    size: number;
    isFile: boolean;
    isDirectory: boolean;
    createdAt: number;
    modifiedAt: number;
}
export interface INeutralinoFs {
    getStats: (path: string) => Stats;
    readFile: (path: string) => any;
    readBinaryFile: (path: string) => any;
    writeFile: (path: string, data: string | ArrayBuffer) => any;
    appendFile: (path: string, data: string | ArrayBuffer) => any;
    moveFile: (fromPath: string, toPath: string) => any;
    removeFile: (path: string) => any;
    removeDirectory: (path: string) => any;
    createDirectory: (path: string) => Promise<{
        entry: 'FILE' | 'DIRECTORY';
        type: string;
    }[]>;
    readDirectory: (path: string) => Promise<{
        entry: 'FILE' | 'DIRECTORY';
        type: string;
    }[]>;
    openFile: (filePath: string) => Promise<string>;
    updateOpenedFile: (fileId: string, readType: 'readAll' | 'read' | 'seek', chunksize: number) => any;
}
export {};
