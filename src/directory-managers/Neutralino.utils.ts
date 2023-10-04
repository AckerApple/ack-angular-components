import { FileStats } from "./DirectoryManagers"

export interface FolderDialogOptions {
  defaultPath?: string
}

export interface INeutralino {
  filesystem: INeutralinoFs
  os: {
    showFolderDialog: (
      title?: string, options?: FolderDialogOptions
    ) => any
  }
  events: {
    on: (eventName: 'openedFile', callback: (a: any) => any) => any
    off: (eventName: 'openedFile', callback: (a: any) => any) => any
  }
}

interface Stats {
  size: number // Size in bytes.
  isFile: boolean // true if the path represents a normal file.
  isDirectory: boolean // true if the path represents a directory.
  createdAt: number // On Windows, returns Unix milliseconds of the file creation time — On Unix or Unix-like platforms, returns Unix milliseconds of the last inode modification time.
  modifiedAt: number // Unix milliseconds of the last file modification time.
}

export interface INeutralinoFs {
  getStats: (path: string) => Stats
  readFile: (path: string) => any
  readBinaryFile: (path: string) => any
  
  writeFile: (path: string, data: string | ArrayBuffer) => any
  appendFile: (path: string, data: string | ArrayBuffer) => any
  
  copyFile: (fromPath: string, toPath: string) => any
  moveFile: (fromPath: string, toPath: string) => any
  removeFile: (path: string) => any
  removeDirectory: (path: string) => any
  
  createDirectory: (path: string) => Promise<{entry: 'FILE' | 'DIRECTORY', type: string}[]>
  readDirectory: (path: string) => Promise<{entry: 'FILE' | 'DIRECTORY', type: string}[]>
  
  openFile: (filePath: string) => Promise<string> // return fileId
  updateOpenedFile: (
    fileId: string,
    readType: 'readAll' | 'read' | 'seek',
    chunksize: number
  ) => any
}
