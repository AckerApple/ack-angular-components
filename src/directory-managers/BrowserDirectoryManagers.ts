import { BaseDmFileReader, DirectoryManager, DmFileReader, findDirectoryWithin, getDirForFilePath, getNameByPath, renameFileInDir } from "./DirectoryManagers"
import { directoryReadToArray } from "./directoryReadToArray.function"
import { path } from "./path"

export class BrowserDmFileReader extends BaseDmFileReader implements DmFileReader {
  name: string

  constructor(
    public file: File | FileSystemFileHandle,
    public directory: DirectoryManager
  ) {
    super()
    this.name = file.name
  }

  async stats() {
    return this.getRealFile()
  }

  async write(fileString: string | ArrayBuffer) {
    let writableStream: any
    const likeFile: any = this.file
    const hasPermission = likeFile.queryPermission && await likeFile.queryPermission() === 'granted'

    if ( hasPermission ) {
      writableStream = await likeFile.createWritable()
    } else {
      // request where to save
      const id = this.name.replace(/[^a-zA-Z0-9]/g,'-')+'-filePicker'
      const savePickerOptions = {
        suggestedName: this.name,
        /*types: [{
          description: 'JSON',
          accept: {
            'application/json': ['.json'],
          },
        }],*/
      }

      // below, thought to remember last matching file (i think data typing is just missing for it)
      ;(savePickerOptions as any).id = id.slice(0, 32)

      const handle = await window.showSaveFilePicker(savePickerOptions)
      
      writableStream = await handle.createWritable()
    }


    // write our file
    await writableStream.write( fileString )

    // close the file and write the contents to disk.
    await writableStream.close()
  }

  private async getRealFile(): Promise<File> {
    const file = this.file as any
    return file.getFile ? await file.getFile() : Promise.resolve(file)
  }
  
  override readAsText(): Promise<string> {
    return new Promise(async (res, rej) => {
      try {
        const reader = new FileReader()
        const file = await this.getRealFile()
        reader.readAsArrayBuffer
        reader.readAsText(file)
        reader.onload = () => res(reader.result as string)
      } catch (err) {
        rej(err)
      }
    })
  }

  readAsDataURL(): Promise<string> {
    return new Promise(async (res, rej) => {
      try {
        var reader = new FileReader()
        const file = await this.getRealFile()
        reader.readAsDataURL(file)
        reader.onload = () => res(reader.result as string)
      } catch (err) {
        rej(err)
      }
    })
  }
}

export class BrowserDirectoryManager implements DirectoryManager {
  name: string

  constructor(
    public path: string,
    public files: FileSystemFileHandle[], // LikeFile[],
    public directoryHandler: FileSystemDirectoryHandle,
  ) {
    this.name = getNameByPath(path)
  }

  findDirectory (
    path: string,
    options?: FileSystemGetDirectoryOptions,
  ): Promise<BrowserDirectoryManager | undefined> {
    return findDirectoryWithin(path, this, options) as Promise<BrowserDirectoryManager | undefined>
  }
  
  async list(): Promise<string[]> {
    const files = await directoryReadToArray(this.directoryHandler)
    return files.map(file => file.name)
  }
  
  async listFolders(): Promise<string[]> {
    const items = await directoryReadToArray(this.directoryHandler)
    return items.filter((file: any) => file.kind && (file as any).kind === 'directory')
      .map(file => file.name)
  }
  
  async listFiles(): Promise<string[]> {
    const items = await directoryReadToArray(this.directoryHandler)
    return items.filter((file: any) => file.kind === 'file')
      .map((file: any) => file.name)
  }
  
  async getFolders(): Promise<DirectoryManager[]> {
    const names = await this.listFolders()
    return Promise.all(
      names.map(async name => await this.getDirectory(name))
    ) as Promise<DirectoryManager[]>
  }
  
  async getFiles(): Promise<DmFileReader[]> {
    const files = await directoryReadToArray(this.directoryHandler)
    return files.filter(file => file.kind === 'file')
      .map(file => new BrowserDmFileReader(file, this))
  }

  createDirectory(
    newPath: string
  ): Promise<DirectoryManager> {
    return this.getDirectory(newPath, { create: true })
  }

  async getDirectory(
    newPath: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<BrowserDirectoryManager> {
    if ( !newPath ) {
      return this
    }

    const newPathArray = newPath.split(/\\|\//)
    let fullNewPath = this.path
    let dir: FileSystemDirectoryHandle

    try {
      // traverse through each folder
      dir  = await newPathArray.reduce(async (last,current) => {
        const next: FileSystemDirectoryHandle = await last
        const newHandle = next.getDirectoryHandle(current, options)
        const name = (await newHandle).name
        fullNewPath = path.join(fullNewPath, name)
        return newHandle
      }, Promise.resolve(this.directoryHandler))
    } catch (err: any) {
      throw new Error(err.message + `. ${newPath} not found in ${this.name} (${this.path})`)
    }

    // TODO: We may not need to read files in advanced (originally we did this for safari)
    const files: FileSystemFileHandle[] = await directoryReadToArray(dir)
    const newDir = new BrowserDirectoryManager(
      fullNewPath,
      files,
      dir
    )
    return newDir
  }

  async removeEntry(
    name: string,
    options?: { recursive: boolean }
  ): Promise<void> {
    const split = name.split(/\\|\//)
    const lastName = split.pop() as string // remove last item
    const subDir = split.length >= 1
    const dir = (subDir ? await this.getDirectory( split.join('/') ) : this) as BrowserDirectoryManager
    return dir.directoryHandler.removeEntry(lastName, options)
  }

  async renameFile(
    oldFileName: string,
    newFileName: string
  ): Promise<DmFileReader> {
    return renameFileInDir(oldFileName, newFileName, this)
  }

  async file(
    path: string,
    options?: FileSystemGetFileOptions,
  ): Promise<DmFileReader> {
    const findFile = await this.findFileByPath(path)
    if ( findFile ) {
      return findFile
    }

    const dirOptions = { create: options?.create }
    const dir = await getDirForFilePath(path, this, dirOptions) as BrowserDirectoryManager
    const fileName = path.split(/\\|\//).pop() as string

    const fileHandle = await dir.directoryHandler.getFileHandle(fileName, options)
    return new BrowserDmFileReader(fileHandle, dir)
  }

  async findFileByPath(
    path: string,
    directoryHandler: any = this.directoryHandler,
  ): Promise<BrowserDmFileReader | undefined> {
    const pathSplit = path.split(/\\|\//)
    const fileName = pathSplit.pop() // pathSplit[ pathSplit.length-1 ]
    let dir: BrowserDirectoryManager = this

    // chrome we dig through the first selected directory and search the subs
    if ( pathSplit.length ) {
      const findDir = await this.findDirectory( pathSplit.join('/') )
      
      if ( !findDir ) {
        return
      }

      dir = findDir
      directoryHandler = dir.directoryHandler
    }
    
    let files = this.files
    files = await directoryReadToArray(directoryHandler)
    const likeFile = files.find(file => file.name === fileName)
    if ( !likeFile ) {
      return
    }
    
    // when found, convert to File
    // const file = await this.getSystemFile(likeFile)
    return new BrowserDmFileReader(likeFile, dir)
  }  
}
