import { stringToXml } from "./stringToXml.function.ts"

export interface DirectoryManager {
  name: string
  path: string

  createDirectory: (path: string) => Promise<DirectoryManager>
  // should throw error if directory does not exist
  getDirectory: (path: string, options?: FileSystemGetDirectoryOptions) => Promise<DirectoryManager>
  // should return undefined if directory does not exist
  findDirectory: (path: string, options?: FileSystemGetDirectoryOptions) => Promise<DirectoryManager | undefined>
  
  list: () => Promise<string[]>
  listFiles: () => Promise<string[]>
  listFolders: () => Promise<string[]>
  
  getFolders: () => Promise<DirectoryManager[]>
  getFiles: () => Promise<DmFileReader[]>
  findFileByPath: (path: string) => Promise<DmFileReader | undefined>
  file: (fileName: string, options?: FileSystemGetFileOptions) => Promise<DmFileReader>
  renameFile: (oldFileName: string, newfileName: string, options?: FileSystemGetFileOptions) => Promise<DmFileReader>

  removeEntry: (name: string, options?: { recursive: boolean }) => Promise<void>
}

export interface FileStats {
  lastModified: number
  lastModifiedDate?: Date
  name: string
  size: number // 788
  type: string // "application/json"
}

export interface DmFileReader {
  directory: DirectoryManager
  name: string
  write: (fileString: string) => Promise<void>
  readAsText: () => Promise<string>
  readAsJson: () => Promise<Object>
  readAsDataURL: () => Promise<string>
  readAsXml: () => Promise<Document>
  readXmlFirstElementByTagName: (tagName: string) => Promise<Element | undefined>
  readXmlElementsByTagName: (tagName: string) => Promise<Element[]>
  readXmlFirstElementContentByTagName: (tagName: string) => Promise<string | null | undefined>
  stats: () => Promise<FileStats>
}

export class BaseDmFileReader {
  async readXmlFirstElementContentByTagName(tagName: string): Promise<string | null | undefined> {
    const elements = await this.readXmlElementsByTagName(tagName)
    return elements.find(tag => tag.textContent )?.textContent
  }

  async readXmlElementsByTagName(tagName: string): Promise<Element[]> {
    const xml = await this.readAsXml()
    return new Array(...xml.getElementsByTagName(tagName) as any)
  }

  async readXmlFirstElementByTagName(tagName: string): Promise<Element | undefined> {
    const xml = await this.readAsXml()
    const elements = new Array(...xml.getElementsByTagName(tagName) as any)
    return elements.length ? elements[0] : undefined
  }

  async readAsXml(): Promise<Document> {
    const string = await this.readAsText()
    return stringToXml( string )
  }
  
  async readAsJson(): Promise<string> {
    return JSON.parse(await this.readAsText())
  }
  
  readAsText(): Promise<string> {
    throw new Error('no override provided for BaseDmFileReader.readAsText')
  }
}

export function getNameByPath(path: string) {
  const half = path.split(/\//).pop() as string
  return half.split(/\\/).pop() as string
}

export async function findDirectoryWithin(
  path: string,
  inDir: DirectoryManager,
  options?: FileSystemGetDirectoryOptions,
): Promise<DirectoryManager | undefined> {
  const pathSplit = path.split('/').filter(x => x)
  
  if ( pathSplit.length >= 1 ) {
    const firstParent = pathSplit.shift() as string // remove index 0 of firstParent/firstParent/file.xyz
    
    try {
      const parent = await inDir.getDirectory(firstParent)
      if ( !parent ) {
        return // undefined
      }
      return await findDirectoryWithin(pathSplit.join('/'), parent, options)
    } catch (err) {
      const folderList = await inDir.listFolders()
      if ( folderList.includes(firstParent) ) {
        throw err // rethrow because its not about a missing folder
      }

      return // our folderList does not contain what we are looking for
    }
  }

  return inDir // return last result
}

export async function renameFileInDir(
  oldFileName: string,
  newFileName: string,
  dir: DirectoryManager
): Promise<DmFileReader> {
  const oldFile = await dir.file(oldFileName)
  const data = await oldFile.readAsText()
  const newFile = await dir.file(newFileName, { create: true })
  await newFile.write(data)
  await dir.removeEntry(oldFileName)
  return newFile
}
