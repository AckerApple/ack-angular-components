import { FileStats } from "./DirectoryManagers"
import { BaseDmFileReader, DmFileReader, streamCallback } from "./DmFileReader"
import { fs, readTextStream, readWriteFile } from "./Neutralino.streams"
import { NeutralinoDirectoryManager } from "./NeutralinoDirectoryManager"

export class NeutralinoDmFileReader extends BaseDmFileReader implements DmFileReader {
  name: string
  
  constructor(
    public filePath: string,
    public directory: NeutralinoDirectoryManager,
  ) {
    super()
    this.name = filePath.split(/\\|\//).pop() as string
  }

  async readTextStream(
    callback: streamCallback,
    chunkSize: number = 82944 // 1024 * 18 because low numbers cause issues
  ): Promise<void> {
    return readTextStream(this.filePath, callback, chunkSize)
  }

  async stats(): Promise<FileStats> {
    const stats = await fs.getStats(this.filePath)
    
    const castedStats = {...stats} as any as FileStats
    castedStats.name = castedStats.name || this.name
    castedStats.lastModified = stats.modifiedAt
    castedStats.type = stats.isFile ? 'file' : 'directory'
    
    return castedStats
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

  /**
   * 1. Creates a file of a similar name and reads from source file
   * 2. Writes to created via append commands
   * 3. The original file is renamed on stream end
   * 4. The new file is named to the original and then original file is then deleted */
  async readWriteTextStream(
    callback: streamCallback,
    chunkSize: number = 1024 * 1024, // 1 MB
  ): Promise<void> {
    const pathTo = this.directory.path
    const fullPath = pathTo + '/' + this.name
    return readWriteFile(fullPath, callback, chunkSize)
  }

  async write(fileString: string | ArrayBuffer) {
    return fs.writeFile(this.filePath, fileString)
  }
}
