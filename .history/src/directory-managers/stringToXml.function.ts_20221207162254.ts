export async function directoryReadToArray(
  // directory: FileSystemFileHandle[] //LikeFile[]
  directory: FileSystemDirectoryHandle //LikeFile[]
): Promise<FileSystemFileHandle[]> {
  const files: FileSystemFileHandle[] = [] // {name: string, kind: string, getFile: () => File}[] = []
  for await (const entry of directory.values()) {
    files.push(entry as any)
  }
  return files
}