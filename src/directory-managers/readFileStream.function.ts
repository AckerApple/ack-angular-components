import { DmFileReader, streamCallback, StreamStats } from "./DmFileReader"

/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file */
export function readFileStream(
  file: File,
  chunkSize: number = 1024 * 1024, // 1MB,
  eachString: streamCallback = (string: string) => undefined
): Promise<void> {
  const fileSize = file.size
  let offset = 0
  let stopped = false

  return new Promise<void>((res, rej) => {
    const reader = new FileReader()

    const stop = () => {
      stopped = true
      reader.abort()
    }
    const cancel = stop
  
    reader.onload = (event) => {
      if (event.target?.result) {        
        eachString(
          event.target.result as string, {
            isLast: (offset + chunkSize) >= fileSize,
            percent: offset / fileSize * 100,
            offset,
            stop,
            cancel
          }
        )
        
        // increment
        offset += chunkSize
      }

      if (!stopped && offset < fileSize) {
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
  transformFn: (
    chunk: string,
    stats: StreamStats
  ) => string, // aka callback
  chunkSize = 1024 * 1024, // 1 MB
): Promise<void> {
  const writableStream = await fileHandle.createWritable() // Open a writable stream for the file
  const onString: streamCallback = async (string, stats) => {
    const originalStop = stats.stop
    stats.stop = () => {
      originalStop() // call the stop we are wrapping
      writableStream.close()
    }
    stats.cancel = () => {
      originalStop() // call the stop we are wrapping
      writableStream.abort()
    }
        
    return writableStream.write(
      await transformFn(string, stats)
    )
  }
  
  await file.readTextStream(onString, chunkSize)
  await writableStream.close()
  writableStream.truncate
}
