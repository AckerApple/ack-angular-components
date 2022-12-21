import { convertSlashes } from "./convertSlashes"
import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers"
import { path } from "./path"

interface INeutralino {
  filesystem: INeutralinoFs
}
interface INeutralinoFs {
  getStats: (path: string) => any
  readFile: (path: string) => any
  writeFile: (path: string, data: string) => any
  readDirectory: (path: string) => Promise<{entry: 'FILE' | 'DIRECTORY', type: string}[]>
}

declare const Neutralino: INeutralino
const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {} as INeutralinoFs

export class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
  name: string
  
  constructor(
    public filePath: string,
    public directory: NeutralinoDirectoryManager,
  ) {
    super()
    this.name = filePath.split('/').pop() as string
  }

  async stats() {
    return fs.getStats(this.filePath)
  }

  override readAsText(): Promise<string> {
    return fs.readFile(this.filePath) // .toString()
  }

  async write(fileString: string) {
    return fs.writeFile(this.filePath, fileString)
  }
}

export class NeutralinoDirectoryManager implements DirectoryManager {
  constructor(
    public path: string,
  ) {}

  async list(): Promise<string[]> {
    const reads = await Neutralino.filesystem.readDirectory( this.path )
    return reads.filter(read => !['.','..'].includes(read.entry)).map(read => read.entry)
  }

  async listFolders(): Promise<string[]> {
    const reads = await Neutralino.filesystem.readDirectory( this.path )
    return reads.filter(read => !['.','..'].includes(read.entry) && read.type === 'DIRECTORY')
      .map(read => read.entry)
  }

  async listFiles(): Promise<string[]> {
    const reads = await Neutralino.filesystem.readDirectory( this.path )
    return reads.filter(read => !['.','..'].includes(read.entry) && read.type !== 'DIRECTORY')
      .map(read => read.entry)
  }

  async getFolders(): Promise<NeutralinoDirectoryManager[]> {
    return Promise.all(
      (await this.listFolders()).map(async name => await this.getDirectory(name))
    )
  }

  async getFiles(): Promise<DmFileReader[]> {
    const reads = await Neutralino.filesystem.readDirectory( this.path )
    return reads.filter(read => !['.','..'].includes(read.entry) && read.type !== 'DIRECTORY')
      .map(read => new NeutralinoDmFileReader(this.getFullPath(read.entry), this))
  }

  async getDirectory(newPath: string) {
    return new NeutralinoDirectoryManager( path.join(this.path, newPath) )
  }

  async findFileByPath (
    filePath: string,
  ): Promise<NeutralinoDmFileReader> {
    const fullFilePath = this.getFullPath(filePath)
    return new NeutralinoDmFileReader(fullFilePath, this)
  }

  file(fileName: string, _options?: FileSystemGetFileOptions) {
    return this.findFileByPath(fileName)
  }

  getFullPath(itemPath: string) {
    let fullFilePath = path.join(this.path, itemPath)
    return convertSlashes(fullFilePath)
  }
}
