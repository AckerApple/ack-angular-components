import { DirectoryManager, FileStats } from "./DirectoryManagers"
import { stringToXml } from "./stringToXml.function.ts"

export interface StreamStats {
  offset: number,
  percent: number,
  isLast: boolean
}

export type streamCallback = (
  string: string,
  stats: StreamStats
) => any

export interface DmFileReader {
  directory: DirectoryManager
  name: string
  
  write: (fileString: string | ArrayBuffer) => Promise<void>
  readWriteTextStream: (
    callback: streamCallback,
    chunkSize?: number, // 1 MB should be default
  ) => Promise<void>
  

  readAsText: () => Promise<string>
  readTextStream: (
    callback: streamCallback,
    chunkSize?: number, // default 1024
  ) => Promise<void>
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
