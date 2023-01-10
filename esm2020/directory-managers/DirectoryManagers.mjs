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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlyZWN0b3J5TWFuYWdlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL0RpcmVjdG9yeU1hbmFnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQXdDdkQsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixLQUFLLENBQUMsbUNBQW1DLENBQUMsT0FBZTtRQUN2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM3RCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFFLEVBQUUsV0FBVyxDQUFBO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsd0JBQXdCLENBQUMsT0FBZTtRQUM1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNsQyxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBUSxDQUFDLENBQUE7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxPQUFlO1FBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBUSxDQUFDLENBQUE7UUFDdkUsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVM7UUFDYixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN0QyxPQUFPLFdBQVcsQ0FBRSxNQUFNLENBQUUsQ0FBQTtJQUM5QixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtJQUM1QyxDQUFDO0lBRUQsVUFBVTtRQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLElBQVk7SUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQVksQ0FBQTtJQUM3QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFZLENBQUE7QUFDekMsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLElBQVksRUFDWixLQUF1QixFQUN2QixPQUF1QztJQUV2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRWhELElBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUc7UUFDM0IsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBWSxDQUFBLENBQUMscURBQXFEO1FBRXJHLElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDcEQsSUFBSyxDQUFDLE1BQU0sRUFBRztnQkFDYixPQUFNLENBQUMsWUFBWTthQUNwQjtZQUNELE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtTQUN2RTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osTUFBTSxVQUFVLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUE7WUFDNUMsSUFBSyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFHO2dCQUN0QyxNQUFNLEdBQUcsQ0FBQSxDQUFDLGlEQUFpRDthQUM1RDtZQUVELE9BQU0sQ0FBQywwREFBMEQ7U0FDbEU7S0FDRjtJQUVELE9BQU8sS0FBSyxDQUFBLENBQUMscUJBQXFCO0FBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzdHJpbmdUb1htbCB9IGZyb20gXCIuL3N0cmluZ1RvWG1sLmZ1bmN0aW9uLnRzXCJcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RvcnlNYW5hZ2VyIHtcbiAgbmFtZTogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBnZXREaXJlY3Rvcnk6IChwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9ucykgPT4gUHJvbWlzZTxEaXJlY3RvcnlNYW5hZ2VyPlxuICBmaW5kRGlyZWN0b3J5OiAocGF0aDogc3RyaW5nLCBvcHRpb25zPzogRmlsZVN5c3RlbUdldERpcmVjdG9yeU9wdGlvbnMpID0+IFByb21pc2U8RGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD5cbiAgXG4gIGxpc3Q6ICgpID0+IFByb21pc2U8c3RyaW5nW10+XG4gIGxpc3RGaWxlczogKCkgPT4gUHJvbWlzZTxzdHJpbmdbXT5cbiAgbGlzdEZvbGRlcnM6ICgpID0+IFByb21pc2U8c3RyaW5nW10+XG4gIFxuICBnZXRGb2xkZXJzOiAoKSA9PiBQcm9taXNlPERpcmVjdG9yeU1hbmFnZXJbXT5cbiAgZ2V0RmlsZXM6ICgpID0+IFByb21pc2U8RG1GaWxlUmVhZGVyW10+XG4gIGZpbmRGaWxlQnlQYXRoOiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPERtRmlsZVJlYWRlciB8IHVuZGVmaW5lZD5cbiAgZmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RmlsZU9wdGlvbnMpID0+IFByb21pc2U8RG1GaWxlUmVhZGVyPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTdGF0cyB7XG4gIGxhc3RNb2RpZmllZDogbnVtYmVyXG4gIGxhc3RNb2RpZmllZERhdGU/OiBEYXRlXG4gIG5hbWU6IHN0cmluZ1xuICBzaXplOiBudW1iZXIgLy8gNzg4XG4gIHR5cGU6IHN0cmluZyAvLyBcImFwcGxpY2F0aW9uL2pzb25cIlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERtRmlsZVJlYWRlciB7XG4gIGRpcmVjdG9yeTogRGlyZWN0b3J5TWFuYWdlclxuICBuYW1lOiBzdHJpbmdcbiAgd3JpdGU6IChmaWxlU3RyaW5nOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD5cbiAgcmVhZEFzVGV4dDogKCkgPT4gUHJvbWlzZTxzdHJpbmc+XG4gIHJlYWRBc0pzb246ICgpID0+IFByb21pc2U8T2JqZWN0PlxuICByZWFkQXNEYXRhVVJMOiAoKSA9PiBQcm9taXNlPHN0cmluZz5cbiAgcmVhZEFzWG1sOiAoKSA9PiBQcm9taXNlPERvY3VtZW50PlxuICByZWFkWG1sRmlyc3RFbGVtZW50QnlUYWdOYW1lOiAodGFnTmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPEVsZW1lbnQgfCB1bmRlZmluZWQ+XG4gIHJlYWRYbWxFbGVtZW50c0J5VGFnTmFtZTogKHRhZ05hbWU6IHN0cmluZykgPT4gUHJvbWlzZTxFbGVtZW50W10+XG4gIHJlYWRYbWxGaXJzdEVsZW1lbnRDb250ZW50QnlUYWdOYW1lOiAodGFnTmFtZTogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ+XG4gIHN0YXRzOiAoKSA9PiBQcm9taXNlPEZpbGVTdGF0cz5cbn1cblxuZXhwb3J0IGNsYXNzIEJhc2VEbUZpbGVSZWFkZXIge1xuICBhc3luYyByZWFkWG1sRmlyc3RFbGVtZW50Q29udGVudEJ5VGFnTmFtZSh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGF3YWl0IHRoaXMucmVhZFhtbEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpXG4gICAgcmV0dXJuIGVsZW1lbnRzLmZpbmQodGFnID0+IHRhZy50ZXh0Q29udGVudCApPy50ZXh0Q29udGVudFxuICB9XG5cbiAgYXN5bmMgcmVhZFhtbEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8RWxlbWVudFtdPiB7XG4gICAgY29uc3QgeG1sID0gYXdhaXQgdGhpcy5yZWFkQXNYbWwoKVxuICAgIHJldHVybiBuZXcgQXJyYXkoLi4ueG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpIGFzIGFueSlcbiAgfVxuXG4gIGFzeW5jIHJlYWRYbWxGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxFbGVtZW50IHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgeG1sID0gYXdhaXQgdGhpcy5yZWFkQXNYbWwoKVxuICAgIGNvbnN0IGVsZW1lbnRzID0gbmV3IEFycmF5KC4uLnhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKSBhcyBhbnkpXG4gICAgcmV0dXJuIGVsZW1lbnRzLmxlbmd0aCA/IGVsZW1lbnRzWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICBhc3luYyByZWFkQXNYbWwoKTogUHJvbWlzZTxEb2N1bWVudD4ge1xuICAgIGNvbnN0IHN0cmluZyA9IGF3YWl0IHRoaXMucmVhZEFzVGV4dCgpXG4gICAgcmV0dXJuIHN0cmluZ1RvWG1sKCBzdHJpbmcgKVxuICB9XG4gIFxuICBhc3luYyByZWFkQXNKc29uKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoYXdhaXQgdGhpcy5yZWFkQXNUZXh0KCkpXG4gIH1cbiAgXG4gIHJlYWRBc1RleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIG92ZXJyaWRlIHByb3ZpZGVkIGZvciBCYXNlRG1GaWxlUmVhZGVyLnJlYWRBc1RleHQnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lQnlQYXRoKHBhdGg6IHN0cmluZykge1xuICBjb25zdCBoYWxmID0gcGF0aC5zcGxpdCgvXFwvLykucG9wKCkgYXMgc3RyaW5nXG4gIHJldHVybiBoYWxmLnNwbGl0KC9cXFxcLykucG9wKCkgYXMgc3RyaW5nXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kRGlyZWN0b3J5V2l0aGluKFxuICBwYXRoOiBzdHJpbmcsXG4gIGluRGlyOiBEaXJlY3RvcnlNYW5hZ2VyLFxuICBvcHRpb25zPzogRmlsZVN5c3RlbUdldERpcmVjdG9yeU9wdGlvbnMsXG4pOiBQcm9taXNlPERpcmVjdG9yeU1hbmFnZXIgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3QgcGF0aFNwbGl0ID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcih4ID0+IHgpXG4gIFxuICBpZiAoIHBhdGhTcGxpdC5sZW5ndGggPj0gMSApIHtcbiAgICBjb25zdCBmaXJzdFBhcmVudCA9IHBhdGhTcGxpdC5zaGlmdCgpIGFzIHN0cmluZyAvLyByZW1vdmUgaW5kZXggMCBvZiBmaXJzdFBhcmVudC9maXJzdFBhcmVudC9maWxlLnh5elxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBhd2FpdCBpbkRpci5nZXREaXJlY3RvcnkoZmlyc3RQYXJlbnQpXG4gICAgICBpZiAoICFwYXJlbnQgKSB7XG4gICAgICAgIHJldHVybiAvLyB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBhd2FpdCBmaW5kRGlyZWN0b3J5V2l0aGluKHBhdGhTcGxpdC5qb2luKCcvJyksIHBhcmVudCwgb3B0aW9ucylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IGZvbGRlckxpc3QgPSBhd2FpdCBpbkRpci5saXN0Rm9sZGVycygpXG4gICAgICBpZiAoIGZvbGRlckxpc3QuaW5jbHVkZXMoZmlyc3RQYXJlbnQpICkge1xuICAgICAgICB0aHJvdyBlcnIgLy8gcmV0aHJvdyBiZWNhdXNlIGl0cyBub3QgYWJvdXQgYSBtaXNzaW5nIGZvbGRlclxuICAgICAgfVxuXG4gICAgICByZXR1cm4gLy8gb3VyIGZvbGRlckxpc3QgZG9lcyBub3QgY29udGFpbiB3aGF0IHdlIGFyZSBsb29raW5nIGZvclxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbkRpciAvLyByZXR1cm4gbGFzdCByZXN1bHRcbn1cbiJdfQ==