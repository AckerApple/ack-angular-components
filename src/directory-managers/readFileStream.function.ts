import { DmFileReader, streamCallback, StreamStats } from "./DmFileReader"

/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file
 * TODO: Needs an abort
*/
export function readFileStream(
  file: File,
  chunkSize: number = 1024 * 1024, // 1MB,
  eachString: streamCallback = (string: string) => undefined
): Promise<void> {
  const fileSize = file.size
  let offset = 0

  return new Promise<void>((res, rej) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        const string = event.target.result as string
        const isLast = (offset + chunkSize) >= fileSize
        const percent = offset / fileSize * 100
        
        eachString(string, {isLast, percent, offset})
        
        // increment
        offset += chunkSize
      }

      if (offset < fileSize) {
        readSlice()
      } else {
        res()
      }
    }

    reader.onerror = rej

    function readSlice() {
      const slice = file.slice(offset, offset + chunkSize)
      reader.readAsText(slice)
    }

    readSlice()
    // return () => reader.abort()
  })
}


export async function readWriteFile(
  file: DmFileReader,
  fileHandle: FileSystemFileHandle,
  transformFn: (chunk: string, stats: StreamStats) => string,
  chunkSize = 1024 * 1024, // 1 MB
): Promise<void> {
  const writableStream = await fileHandle.createWritable() // Open a writable stream for the file
  
  const onString: streamCallback = async (string, {isLast, percent, offset}) => {
    const newString = await transformFn(string, {
      isLast, percent, offset,
    })

    const result = {
      string: newString, offset,
    }
    
    return writableStream.write(result.string)
  }
  
  await file.readTextStream(onString, chunkSize)
  await writableStream.close()
}
