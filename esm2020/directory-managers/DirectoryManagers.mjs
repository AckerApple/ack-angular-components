import { stringToXml } from "./stringToXml.function.ts";
export class BaseDmFileReader {
    async readXmlFirstElementContentByTagName(tagName) {
        const elements = await this.readXmlElementsByTagName(tagName);
        return elements.find(tag => tag.textContent)?.textContent;
    }
    async readXmlElementsByTagName(tagName) {
        const xml = await this.readAsXml();
        return new Array(...xml.getElementsByTagName(tagName));
    }
    async readXmlFirstElementByTagName(tagName) {
        const xml = await this.readAsXml();
        const elements = new Array(...xml.getElementsByTagName(tagName));
        return elements.length ? elements[0] : undefined;
    }
    async readAsXml() {
        const string = await this.readAsText();
        return stringToXml(string);
    }
    async readAsJson() {
        return JSON.parse(await this.readAsText());
    }
    readAsText() {
        throw new Error('no override provided for BaseDmFileReader.readAsText');
    }
}
export function getNameByPath(path) {
    const half = path.split(/\//).pop();
    return half.split(/\\/).pop();
}
export async function findDirectoryWithin(path, inDir, options) {
    const pathSplit = path.split('/').filter(x => x);
    if (pathSplit.length >= 1) {
        const firstParent = pathSplit.shift(); // remove index 0 of firstParent/firstParent/file.xyz
        try {
            const parent = await inDir.getDirectory(firstParent);
            if (!parent) {
                return; // undefined
            }
            return await findDirectoryWithin(pathSplit.join('/'), parent, options);
        }
        catch (err) {
            const folderList = await inDir.listFolders();
            if (folderList.includes(firstParent)) {
                throw err; // rethrow because its not about a missing folder
            }
            return; // our folderList does not contain what we are looking for
        }
    }
    return inDir; // return last result
}
export async function renameFileInDir(oldFileName, newFileName, dir) {
    const oldFile = await dir.file(oldFileName);
    const data = await oldFile.readAsText();
    const newFile = await dir.file(newFileName, { create: true });
    await newFile.write(data);
    await dir.removeEntry(oldFileName);
    return newFile;
}
export async function getDirForFilePath(path, fromDir, options) {
    const pathSplit = path.split(/\\|\//);
    pathSplit.pop(); // remove the file
    const pathWithoutFile = pathSplit.join('/');
    return await fromDir.getDirectory(pathWithoutFile, options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlyZWN0b3J5TWFuYWdlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL0RpcmVjdG9yeU1hbmFnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQWlFdkQsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixLQUFLLENBQUMsbUNBQW1DLENBQUMsT0FBZTtRQUN2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM3RCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFFLEVBQUUsV0FBVyxDQUFBO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsd0JBQXdCLENBQUMsT0FBZTtRQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNsQyxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBUSxDQUFDLENBQUE7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxPQUFlO1FBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBUSxDQUFDLENBQUE7UUFDdkUsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDYixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLEVB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ZXNDb250ZW50IjpbImltcG9ydCB7IHN0cmluZ1RvWG1sIH0gZnJvbSBcIi4vc3RyaW5nVG9YbWwuZnVuY3Rpb24udHNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdG9yeU1hbmFnZXIge1xuICBuYW1lOiBzdHJpbmdcbiAgcGF0aDogc3RyaW5nXG5cbiAgY3JlYXRlRGlyZWN0b3J5OiAoXG4gICAgcGF0aDogc3RyaW5nXG4gICkgPT4gUHJvbWlzZTxEaXJlY3RvcnlNYW5hZ2VyPlxuXG4gIC8vIHNob3VsZCB0aHJvdyBlcnJvciBpZiBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3RcbiAgZ2V0RGlyZWN0b3J5OiAoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9uc1xuICApID0+IFByb21pc2U8RGlyZWN0b3J5TWFuYWdlcj5cbiAgXG4gIC8vIHNob3VsZCByZXR1cm4gdW5kZWZpbmVkIGlmIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdFxuICBmaW5kRGlyZWN0b3J5OiAocGF0aDogc3RyaW5nLCBvcHRpb25zPzogRmlsZVN5c3RlbUdldERpcmVjdG9yeU9wdGlvbnMpID0+IFByb21pc2U8RGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD5cbiAgXG4gIGxpc3Q6ICgpID0+IFByb21pc2U8c3RyaW5nW10+XG4gIGxpc3RGaWxlczogKCkgPT4gUHJvbWlzZTxzdHJpbmdbXT5cbiAgbGlzdEZvbGRlcnM6ICgpID0+IFByb21pc2U8c3RyaW5nW10+XG4gIFxuICBnZXRGb2xkZXJzOiAoKSA9PiBQcm9taXNlPERpcmVjdG9yeU1hbmFnZXJbXT5cbiAgZ2V0RmlsZXM6ICgpID0+IFByb21pc2U8RG1GaWxlUmVhZGVyW10+XG4gIGZpbmRGaWxlQnlQYXRoOiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPERtRmlsZVJlYWRlciB8IHVuZGVmaW5lZD5cbiAgZmlsZTogKFxuICAgIGZpbGVOYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXRGaWxlT3B0aW9uc1xuICApID0+IFByb21pc2U8RG1GaWxlUmVhZGVyPlxuXG4gIHJlbmFtZUZpbGU6IChcbiAgICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICAgIG5ld2ZpbGVOYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXRGaWxlT3B0aW9uc1xuICApID0+IFByb21pc2U8RG1GaWxlUmVhZGVyPlxuXG4gIHJlbW92ZUVudHJ5OiAoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IHJlY3Vyc2l2ZTogYm9vbGVhbiB9XG4gICkgPT4gUHJvbWlzZTx2b2lkPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTdGF0cyB7XG4gIGxhc3RNb2RpZmllZDogbnVtYmVyXG4gIGxhc3RNb2RpZmllZERhdGU/OiBEYXRlXG4gIG5hbWU6IHN0cmluZ1xuICBzaXplOiBudW1iZXIgLy8gNzg4XG4gIHR5cGU6IHN0cmluZyAvLyBcImFwcGxpY2F0aW9uL2pzb25cIlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERtRmlsZVJlYWRlciB7XG4gIGRpcmVjdG9yeTogRGlyZWN0b3J5TWFuYWdlclxuICBuYW1lOiBzdHJpbmdcbiAgd3JpdGU6IChmaWxlU3RyaW5nOiBzdHJpbmcgfCBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTx2b2lkPlxuICByZWFkQXNUZXh0OiAoKSA9PiBQcm9taXNlPHN0cmluZz5cbiAgcmVhZEFzSnNvbjogKCkgPT4gUHJvbWlzZTxPYmplY3Q+XG4gIHJlYWRBc0RhdGFVUkw6ICgpID0+IFByb21pc2U8c3RyaW5nPlxuICByZWFkQXNYbWw6ICgpID0+IFByb21pc2U8RG9jdW1lbnQ+XG4gIHJlYWRYbWxGaXJzdEVsZW1lbnRCeVRhZ05hbWU6ICh0YWdOYW1lOiBzdHJpbmcpID0+IFByb21pc2U8RWxlbWVudCB8IHVuZGVmaW5lZD5cbiAgcmVhZFhtbEVsZW1lbnRzQnlUYWdOYW1lOiAodGFnTmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPEVsZW1lbnRbXT5cbiAgcmVhZFhtbEZpcnN0RWxlbWVudENvbnRlbnRCeVRhZ05hbWU6ICh0YWdOYW1lOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZD5cbiAgc3RhdHM6ICgpID0+IFByb21pc2U8RmlsZVN0YXRzPlxufVxuXG5leHBvcnQgY2xhc3MgQmFzZURtRmlsZVJlYWRlciB7XG4gIGFzeW5jIHJlYWRYbWxGaXJzdEVsZW1lbnRDb250ZW50QnlUYWdOYW1lKHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gYXdhaXQgdGhpcy5yZWFkWG1sRWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSlcbiAgICByZXR1cm4gZWxlbWVudHMuZmluZCh0YWcgPT4gdGFnLnRleHRDb250ZW50ICk/LnRleHRDb250ZW50XG4gIH1cblxuICBhc3luYyByZWFkWG1sRWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxFbGVtZW50W10+IHtcbiAgICBjb25zdCB4bWwgPSBhd2FpdCB0aGlzLnJlYWRBc1htbCgpXG4gICAgcmV0dXJuIG5ldyBBcnJheSguLi54bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSkgYXMgYW55KVxuICB9XG5cbiAgYXN5bmMgcmVhZFhtbEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEVsZW1lbnQgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCB4bWwgPSBhd2FpdCB0aGlzLnJlYWRBc1htbCgpXG4gICAgY29uc3QgZWxlbWVudHMgPSBuZXcgQXJyYXkoLi4ueG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpIGFzIGFueSlcbiAgICByZXR1cm4gZWxlbWVudHMubGVuZ3RoID8gZWxlbWVudHNbMF0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIGFzeW5jIHJlYWRBc1htbCgpOiBQcm9taXNlPERvY3VtZW50PiB7XG4gICAgY29uc3Qgc3RyaW5nID0gYXdhaXQgdGhpcy5yZWFkQXNUZXh0KClcbiAgICByZXR1cm4gc3RyaW5nVG9YbWwoIHN0cmluZyApXG4gIH1cbiAgXG4gIGFzeW5jIHJlYWRBc0pzb24oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShhd2FpdCB0aGlzLnJlYWRBc1RleHQoKSlcbiAgfVxuICBcbiAgcmVhZEFzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRocm93IG5ldyBFcnJvcignbm8gb3ZlcnJpZGUgcHJvdmlkZWQgZm9yIEJhc2VEbUZpbGVSZWFkZXIucmVhZEFzVGV4dCcpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5hbWVCeVBhdGgocGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGhhbGYgPSBwYXRoLnNwbGl0KC9cXC8vKS5wb3AoKSBhcyBzdHJpbmdcbiAgcmV0dXJuIGhhbGYuc3BsaXQoL1xcXFwvKS5wb3AoKSBhcyBzdHJpbmdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmREaXJlY3RvcnlXaXRoaW4oXG4gIHBhdGg6IHN0cmluZyxcbiAgaW5EaXI6IERpcmVjdG9yeU1hbmFnZXIsXG4gIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9ucyxcbik6IFByb21pc2U8RGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD4ge1xuICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKHggPT4geClcbiAgXG4gIGlmICggcGF0aFNwbGl0Lmxlbmd0aCA+PSAxICkge1xuICAgIGNvbnN0IGZpcnN0UGFyZW50ID0gcGF0aFNwbGl0LnNoaWZ0KCkgYXMgc3RyaW5nIC8vIHJlbW92ZSBpbmRleCAwIG9mIGZpcnN0UGFyZW50L2ZpcnN0UGFyZW50L2ZpbGUueHl6XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGF3YWl0IGluRGlyLmdldERpcmVjdG9yeShmaXJzdFBhcmVudClcbiAgICAgIGlmICggIXBhcmVudCApIHtcbiAgICAgICAgcmV0dXJuIC8vIHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGF3YWl0IGZpbmREaXJlY3RvcnlXaXRoaW4ocGF0aFNwbGl0LmpvaW4oJy8nKSwgcGFyZW50LCBvcHRpb25zKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgZm9sZGVyTGlzdCA9IGF3YWl0IGluRGlyLmxpc3RGb2xkZXJzKClcbiAgICAgIGlmICggZm9sZGVyTGlzdC5pbmNsdWRlcyhmaXJzdFBhcmVudCkgKSB7XG4gICAgICAgIHRocm93IGVyciAvLyByZXRocm93IGJlY2F1c2UgaXRzIG5vdCBhYm91dCBhIG1pc3NpbmcgZm9sZGVyXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAvLyBvdXIgZm9sZGVyTGlzdCBkb2VzIG5vdCBjb250YWluIHdoYXQgd2UgYXJlIGxvb2tpbmcgZm9yXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluRGlyIC8vIHJldHVybiBsYXN0IHJlc3VsdFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVuYW1lRmlsZUluRGlyKFxuICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICBuZXdGaWxlTmFtZTogc3RyaW5nLFxuICBkaXI6IERpcmVjdG9yeU1hbmFnZXJcbik6IFByb21pc2U8RG1GaWxlUmVhZGVyPiB7XG4gIGNvbnN0IG9sZEZpbGUgPSBhd2FpdCBkaXIuZmlsZShvbGRGaWxlTmFtZSlcbiAgY29uc3QgZGF0YSA9IGF3YWl0IG9sZEZpbGUucmVhZEFzVGV4dCgpXG4gIGNvbnN0IG5ld0ZpbGUgPSBhd2FpdCBkaXIuZmlsZShuZXdGaWxlTmFtZSwgeyBjcmVhdGU6IHRydWUgfSlcbiAgYXdhaXQgbmV3RmlsZS53cml0ZShkYXRhKVxuICBhd2FpdCBkaXIucmVtb3ZlRW50cnkob2xkRmlsZU5hbWUpXG4gIHJldHVybiBuZXdGaWxlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREaXJGb3JGaWxlUGF0aChcbiAgcGF0aDogc3RyaW5nLFxuICBmcm9tRGlyOiBEaXJlY3RvcnlNYW5hZ2VyLFxuICBvcHRpb25zPzogRmlsZVN5c3RlbUdldERpcmVjdG9yeU9wdGlvbnMsXG4pIHtcbiAgY29uc3QgcGF0aFNwbGl0ID0gcGF0aC5zcGxpdCgvXFxcXHxcXC8vKVxuICBwYXRoU3BsaXQucG9wKCkgYXMgc3RyaW5nIC8vIHJlbW92ZSB0aGUgZmlsZVxuICBjb25zdCBwYXRoV2l0aG91dEZpbGUgPSBwYXRoU3BsaXQuam9pbignLycpXG5cbiAgcmV0dXJuIGF3YWl0IGZyb21EaXIuZ2V0RGlyZWN0b3J5KHBhdGhXaXRob3V0RmlsZSwgb3B0aW9ucylcbn1cbiJdfQ==