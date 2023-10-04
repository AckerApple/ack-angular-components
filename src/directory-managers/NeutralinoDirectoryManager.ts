import { convertSlashes } from "./convertSlashes"
import { DirectoryManager, findDirectoryWithin, getDirForFilePath, getNameByPath, renameFileInDir } from "./DirectoryManagers"
import { DmFileReader } from "./DmFileReader"
import { INeutralino } from "./Neutralino.utils"
import { NeutralinoDmFileReader } from "./NeutralinoDmFileReader"
import { path } from "./path"

declare const Neutralino: INeutralino

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
  ): Promise<NeutralinoDirectoryManager | undefined> {
    return findDirectoryWithin(path, this, options) as Promise<NeutralinoDirectoryManager | undefined>
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

  async createDirectory(
    newPath: string
  ): Promise<NeutralinoDirectoryManager> {
    try {
      const fullPath = path.join(this.path, convertSlashes(newPath))
      await Neutralino.filesystem.readDirectory( fullPath )

      // it exists, just read it
      return this.getDirectory(newPath)
    } catch( err: any ){
      if ( err.code === 'NE_FS_NOPATHE' ) {
        const splitPath = convertSlashes(newPath).split('/')
        let pathTo = this.path
        
        while( splitPath.length ) {
          const nowName = splitPath.shift() as string
          pathTo = path.join(pathTo, nowName)
          await Neutralino.filesystem.createDirectory(pathTo)
        }
    
        const fullPath = pathTo // path.join(this.path, newPath)
        return new NeutralinoDirectoryManager( fullPath )    
      }
      throw err
    }
  }

  async getDirectory(
    newPath: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<NeutralinoDirectoryManager> {
    if ( !newPath ) {
      return this
    }
    
    const pathTo = path.join(this.path, newPath)
    
    try {
      // ensure path exists
      await Neutralino.filesystem.readDirectory(pathTo)
      return new NeutralinoDirectoryManager( pathTo )
    } catch (err: any) {
      if ( err.code === 'NE_FS_NOPATHE' && options?.create ) {
        return this.createDirectory(newPath)
      }
      throw err // rethrow
    }
  }

  async findFileByPath (
    path: string,
  ): Promise<NeutralinoDmFileReader | undefined> {
    const pathSplit = path.split(/\\|\//)
    const fileName = (pathSplit.pop() as string).toLowerCase() // pathSplit[ pathSplit.length-1 ]
    let dir: NeutralinoDirectoryManager = this

    // chrome we dig through the first selected directory and search the subs
    if ( pathSplit.length ) {
      const findDir = await this.findDirectory( pathSplit.join('/') )
      
      if ( !findDir ) {
        return
      }
      
      dir = findDir
    }
    
    const files = await dir.listFiles()
    const matchName = files.find(listName => listName.toLowerCase() === fileName)
    if ( !matchName ) {
      return
    }

    const fullPath = dir.getFullPath(matchName)
    return new NeutralinoDmFileReader(fullPath, dir)
  }

  async file(
    pathTo: string,
    options?: FileSystemGetFileOptions
  ) {
    const existingFile = await this.findFileByPath(pathTo)

    if ( existingFile ) {
      return existingFile
    }

    // TODO: This work should most likely only occur if the options.create flag is present otherwise throw not found error
    const dirOptions = { create: options?.create }
    const dir = await getDirForFilePath(pathTo, this, dirOptions) as NeutralinoDirectoryManager
    const fileName = pathTo.split(/\\|\//).pop() as string
    const fullPath = path.join(dir.path, fileName)

    return new NeutralinoDmFileReader(fullPath, dir)
  }

  getFullPath(itemPath: string) {
    let fullFilePath = path.join(this.path, itemPath)
    return convertSlashes(fullFilePath)
  }

  async copyFile(
    oldFileName: string,
    newFileName: string
  ) {
    const copyFrom = path.join(this.path, oldFileName)
    const pasteTo = path.join(this.path, newFileName)
    await Neutralino.filesystem.copyFile(copyFrom, pasteTo)
    return await this.file(newFileName)
  }

  async renameFile(
    oldFileName: string,
    newFileName: string
  ): Promise<DmFileReader> {
    return renameFileInDir(oldFileName, newFileName, this)
  }

  async removeEntry(
    name: string,
    options?: { recursive: boolean }
  ): Promise<void> {
    const split = name.split(/\\|\//)
    const lastName = split.pop() as string // remove last item
    const dir = split.length >= 1 ? await this.getDirectory( split.join('/') ) : this

    const pathTo = path.join(dir.path, lastName)
    
    const fileNames = await dir.listFiles()
    if ( fileNames.includes(lastName) ) {
      return Neutralino.filesystem.removeFile(pathTo)
    }
        
    try {
      await Neutralino.filesystem.removeDirectory(pathTo)
    } catch (err: any) {
      // if folder delete failed, it may have items within Neutralino does not have recursive delete
      if ( err.code === 'NE_FS_RMDIRER' && options?.recursive ) {
        return recurseRemoveDir( await dir.getDirectory(lastName) )
      }
      throw err
    }
    return
  }
}

async function recurseRemoveDir(
  dir: NeutralinoDirectoryManager
) {
  // remove all folders within
  const folders = await dir.getFolders()
  for (const subdir of folders) {
    await recurseRemoveDir(subdir)
  }

  // remove all files within
  const list = await dir.listFiles()
  for (const fileName of list) {
    await dir.removeEntry(fileName)
  }

  // try now to delete again
  return Neutralino.filesystem.removeDirectory( dir.path )
}