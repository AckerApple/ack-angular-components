export function stringToXml(string: string) {
  const parser = new DOMParser()
  const result = parser.parseFromString(string.trim(), "text/xml")
  return result
}
