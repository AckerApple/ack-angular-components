import { convertSlashes } from "./convertSlashes"
import { BaseDmFileReader, DirectoryManager, DmFileReader, findDirectoryWithin, getNameByPath, renameFileInDir } from "./DirectoryManagers"
import { path } from "./path"

interface INeutralino {
  filesystem: INeutralinoFs
}
interface INeutralinoFs {
  getStats: (path: string) => any
  readFile: (path: string) => any
  readBinaryFile: (path: string) => any
  writeFile: (path: string, data: string) => any
  removeFile: (path: string) => any
  removeDirectory: (path: string) => any
  
  createDirectory: (path: string) => Promise<{entry: 'FILE' | 'DIRECTORY', type: string}[]>
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
    this.name = filePath.split(/\\|\//).pop() as string
  }

  async stats() {
    const stats = await fs.getStats(this.filePath)
    stats.name = stats.name || this.name
    return stats
  }

  override readAsText(): Promise<string> {
    return fs.readFile(this.filePath) // .toString()
  }
  
  async readAsDataURL(): Promise<string> {
    let data = await fs.readBinaryFile(this.filePath)
    const view = new Uint8Array(data);
    var decoder = new TextDecoder('utf8');
    var b64encoded = btoa(decoder.decode(view))
    return b64encoded
  }

  async write(fileString: string) {
    return fs.writeFile(this.filePath, fileString)
  }
}

export class NeutralinoDirectoryManager implements DirectoryManager {
  name: string

  constructor(
    public path: string,
  ) {
    this.name = getNameByPath(path)
  }

  findDirectory (
    path: string,
    options?: FileSystemGetDirectoryOptions,
  ): Promise<DirectoryManager | undefined> {
    return findDirectoryWithin(path, this, options)
  }

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

  async createDirectory(newPath: string): Promise<DirectoryManager> {
    const pathTo = path.join(this.path, newPath)
    await Neutralino.filesystem.createDirectory(pathTo)
    return this.getDirectory(newPath)
  }

  async getDirectory(newPath: string) {
    if ( !newPath ) {
      return this
    }
    
    const pathTo = path.join(this.path, newPath)
    
    // ensure path exists
    await Neutralino.filesystem.readDirectory(pathTo)
    
    return new NeutralinoDirectoryManager( pathTo )
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

  async renameFile(
    oldFileName: string,
    newFileName: string
  ) {
    return renameFileInDir(oldFileName, newFileName, this)
  }

  async removeEntry(
    name: string,
    // options?: { recursive: boolean }
  ): Promise<void> {
    const split = name.split(/\\|\//)
    const lastName = split.pop() as string // remove last item
    const dir = split.length >= 1 ? await this.getDirectory( split.join('/') ) : this

    const pathTo = path.join(dir.path, name)
    
    const fileNames = await dir.listFiles()
    if ( fileNames.includes(lastName) ) {
      return Neutralino.filesystem.removeFile(pathTo)
    }
    
    await Neutralino.filesystem.removeDirectory(pathTo)
    return
  }
}
