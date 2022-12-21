export function stringToXml(string: string) {
  return new DOMParser().parseFromString(string.trim(), "text/xml")
}
