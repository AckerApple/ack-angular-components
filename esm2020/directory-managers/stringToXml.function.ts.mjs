export function stringToXml(string) {
    const parser = new DOMParser();
    const result = parser.parseFromString(string.trim(), "text/xml");
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nVG9YbWwuZnVuY3Rpb24udHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL3N0cmluZ1RvWG1sLmZ1bmN0aW9uLnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxXQUFXLENBQUMsTUFBYztJQUN4QyxNQUFNLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFBO0lBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQ2hFLE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb1htbChzdHJpbmc6IHN0cmluZykge1xuICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKClcbiAgY29uc3QgcmVzdWx0ID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzdHJpbmcudHJpbSgpLCBcInRleHQveG1sXCIpXG4gIHJldHVybiByZXN1bHRcbn1cbiJdfQ==