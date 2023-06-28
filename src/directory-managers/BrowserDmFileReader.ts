import { readFileStream, readWriteFile } from "./readFileStream.function"
import { BaseDmFileReader, DmFileReader, streamCallback } from "./DmFileReader"
import { DirectoryManager } from "./DirectoryManagers"

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

  async readTextStream(
    callback: streamCallback,
    chunkSize: number = 1024,
  ): Promise<void> {
    const file = await this.getRealFile()
    return readFileStream(file, chunkSize, callback)
  }

  async readWriteTextStream(
    callback: streamCallback,
    chunkSize: number = 1024 * 1024, // 1 MB
  ): Promise<void> {
    const handle = this.file as FileSystemFileHandle
    return readWriteFile(this, handle, callback, chunkSize)
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
        /*
        // todo: may need to use mime types
        types: [{
          description: 'JSON',
          accept: {
            'application/json': ['.json'],
          },
        }],
        */
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
        reader.onload = () => {
          const result = reader.result as string
          // remove `data:application/json;base64,`
          // remove `data:image/png;base64,`
          // const replaced = result.replace(/^.+,/,'')
          res(result)
        }
      } catch (err) {
        rej(err)
      }
    })
  }
}
