import { BaseDmFileReader, DirectoryManager, DmFileReader } from "./DirectoryManagers"
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

  async write(fileString: string) {
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
        var reader = new FileReader()
        const file = await this.getRealFile()
        reader.readAsText(file)
        reader.onload = () => res(reader.result as string)
      } catch (err) {
        rej(err)
      }
    })
  }
}

export class BrowserDirectoryManager implements DirectoryManager {
  constructor(
    public path: string,
    public files: FileSystemFileHandle[], // LikeFile[],
    public directoryHandler: FileSystemDirectoryHandle,
  ) {}

  async list(): Promise<string[]> {
    return this.files.map(file => file.name)
  }
  
  async listFolders(): Promise<string[]> {
    return this.files.filter(file => file.kind && (file as any).kind === 'directory')
      .map(file => file.name)
  }
  
  async listFiles(): Promise<string[]> {
    return this.files.filter(file => file.kind === 'file')
      .map(file => file.name)
  }
  
  async getFolders(): Promise<BrowserDirectoryManager[]> {
    return Promise.all(
      this.files.filter(file => file.kind && (file as any).kind === 'directory')
        .map(async file => await this.getDirectory(file.name))
    )
  }
  
  async getFiles(): Promise<DmFileReader[]> {
    return this.files.filter(file => file.kind === 'file')
      .map(file => new BrowserDmFileReader(file, this))
  }

  async getDirectory(
    newPath: string,
    options?: FileSystemGetDirectoryOptions
  ) {
    const newPathArray = newPath.split('/')
    let fullNewPath = this.path
    
    // traverse through each folder
    const dir: FileSystemDirectoryHandle = await newPathArray.reduce(async (last,current) => {
      const next: FileSystemDirectoryHandle = await last
      const newHandle = next.getDirectoryHandle(current, options)
      const name = (await newHandle).name
      fullNewPath = path.join(fullNewPath, name)
      return newHandle
    }, Promise.resolve(this.directoryHandler))
    
    const files: FileSystemFileHandle[] = await directoryReadToArray(dir)
    const newDir = new BrowserDirectoryManager(
      fullNewPath,
      files,
      dir
    )
    return newDir
  }

  async file(fileName: string, options?: FileSystemGetFileOptions) {
    const findFile = await this.findFileByPath(fileName)

    if ( findFile ) {
      return findFile
    }

    const fileHandle = await this.directoryHandler.getFileHandle(fileName, options)
    return new BrowserDmFileReader(fileHandle, this)
  }

  async findFileByPath(
    path: string,
    directoryHandler: any = this.directoryHandler,
  ): Promise<BrowserDmFileReader | undefined> {
    const pathSplit = path.split('/')
    const fileName = pathSplit[ pathSplit.length-1 ]
    if ( !this.files.length ) {
      return
    }

    // chrome we dig through the first selected directory and search the subs
    if ( pathSplit.length > 1 ) {
      const lastParent = pathSplit.shift() as string // remove index 0 of lastParent/firstParent/file.xyz
      const newHandler = await directoryHandler.getDirectoryHandle( lastParent )
      
      if ( !newHandler ) {
        console.debug('no matching upper folder', lastParent, directoryHandler)
        return
      }

      const newPath = pathSplit.join('/')
      const dirMan = await this.getDirectory(lastParent)
      
      return dirMan.findFileByPath(newPath, newHandler)
    }
    
    let files = this.files
    if ( directoryHandler ) {
      files = await directoryReadToArray(directoryHandler)
    }
    
    const likeFile = files.find(file => file.name === fileName)
    if ( !likeFile ) {
      return
    }
    
    // when found, convert to File
    // const file = await this.getSystemFile(likeFile)
    
    return new BrowserDmFileReader(likeFile, this)
  }
}