import { INeutralino, INeutralinoFs } from "./Neutralino.utils"
import { streamCallback } from "./DmFileReader"

declare const Neutralino: INeutralino
export const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {} as INeutralinoFs

/** Read a file in streams awaiting a callback to process each stream before reading another */
export async function readTextStream(
  filePath: string,
  callback: streamCallback,
  // Below, if number is too low, Neutralino witnessed will fail NE_RT_NATRTER (hopefully its not a specific number used versus how much is available to stream in targeted file)
  chunkSize = 1024 * 18,
): Promise<void> {
  return new Promise(async (res, rej) => {
    let offset = 0
    const stats = await fs.getStats(filePath)
    const size = stats.size

    if ( chunkSize > size ) {
      chunkSize = size
    }

    let close = () => {
      Neutralino.events.off('openedFile', dataCallback)
      res( undefined )
      
      // prevent calling callbacks twice by redeclaring them
      const empty = () => undefined
      close = empty
      dataCallback = empty
    }

    // main callback used to read each stream of data. On close of stream, its re-declared as an empty function
    let dataCallback = (evt: any) => {
      if(evt.detail.id != fileId) {
        return // this call is not for us
      }

      switch(evt.detail.action) {
        case 'data':
          const isLast = (offset + chunkSize) >= size
          const percent = offset / size * 100
          const string = evt.detail.data
                      
          try {
            // if callback return promise, wait for it
            return Promise.resolve( callback(string, { offset, isLast, percent }) )
              .then(() => {
                offset = offset + chunkSize // increase for next iteration

                // are we done or shall we trigger the next read?
                isLast ? close() : read()
              })
          } catch (err) {
            rej(err)
            return close() // error should force everything to stop
          }
        case 'end':
          close() // indication of done by Neutralino
          return
      }
    }

    // used at every time we are ready to continue reading
    const read = async () => {
      try {
        // no await here needed (dataCallback will be called)
        await Neutralino.filesystem.updateOpenedFile(fileId, 'read', chunkSize)
      } catch (err) {
        rej(err)
        close()
      }  
    }

    // Create a callback calling callback so incase we need to prevent further calls we can switch out the first callback
    const realCallback = (evt: any) => dataCallback(evt)

    // start the actual processing
    Neutralino.events.on('openedFile', realCallback)
    const fileId = await Neutralino.filesystem.openFile( filePath )
    read()
  })
}  

/** Read a file in streams awaiting a callback to provide a string to write as new content for the original read file
 * 1. A blank file is created
 * 2. Original file is read in streams
 * 3. Result from callback is appended to the file in step 1
 * 4. When all of file is read we rename the original file
 * 5. The file we append all results to, is renamed to the original files name
 * 6. The original file, that was renamed, is now deleted
 * - All of the above must be performed as Neutralino does not support stream writing like the browser does
*/
export async function readWriteFile(
  filePath: string,
  callback: streamCallback,
  chunkSize: number = 1024 * 18 // Too low a number, can error. More details in file search for "chunkSize" in this file
): Promise<void> {
  const cloneFullPath = filePath + '.writing'

  // create an empty file we will stream results into
  await Neutralino.filesystem.writeFile(cloneFullPath, '')

  // create callback that will handle each part of the stream
  const midware: streamCallback = (string, stats) => {
    const newString = callback(string, stats)
    
    // no await
    return Neutralino.filesystem.appendFile(cloneFullPath, newString)
  }

  // stream the entire file
  await readTextStream(filePath, midware, chunkSize)

  // rename original file just incase any issues with next step(s)
  const renameFullPath = filePath + '.original'
  await Neutralino.filesystem.moveFile(filePath, renameFullPath)

  // rename the file we stream wrote
  await Neutralino.filesystem.moveFile(cloneFullPath, filePath)

  // delete original file because we are done
  await Neutralino.filesystem.removeFile(renameFullPath)
}