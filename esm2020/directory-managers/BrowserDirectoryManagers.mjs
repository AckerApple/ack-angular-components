import { BaseDmFileReader, findDirectoryWithin, getNameByPath, renameFileInDir } from "./DirectoryManagers";
import { directoryReadToArray } from "./directoryReadToArray.function";
import { path } from "./path";
export class BrowserDmFileReader extends BaseDmFileReader {
    constructor(file, directory) {
        super();
        this.file = file;
        this.directory = directory;
        this.name = file.name;
    }
    async stats() {
        return this.getRealFile();
    }
    async write(fileString) {
        let writableStream;
        const likeFile = this.file;
        const hasPermission = likeFile.queryPermission && await likeFile.queryPermission() === 'granted';
        if (hasPermission) {
            writableStream = await likeFile.createWritable();
        }
        else {
            // request where to save
            const id = this.name.replace(/[^a-zA-Z0-9]/g, '-') + '-filePicker';
            const savePickerOptions = {
                suggestedName: this.name,
                /*types: [{
                  description: 'JSON',
                  accept: {
                    'application/json': ['.json'],
                  },
                }],*/
            };
            savePickerOptions.id = id.slice(0, 32);
            const handle = await window.showSaveFilePicker(savePickerOptions);
            writableStream = await handle.createWritable();
        }
        // write our file
        await writableStream.write(fileString);
        // close the file and write the contents to disk.
        await writableStream.close();
    }
    async getRealFile() {
        const file = this.file;
        return file.getFile ? await file.getFile() : Promise.resolve(file);
    }
    readAsText() {
        return new Promise(async (res, rej) => {
            try {
                var reader = new FileReader();
                const file = await this.getRealFile();
                reader.readAsText(file);
                reader.onload = () => res(reader.result);
            }
            catch (err) {
                rej(err);
            }
        });
    }
    readAsDataURL() {
        return new Promise(async (res, rej) => {
            try {
                var reader = new FileReader();
                const file = await this.getRealFile();
                reader.readAsDataURL(file);
                reader.onload = () => res(reader.result);
            }
            catch (err) {
                rej(err);
            }
        });
    }
}
export class BrowserDirectoryManager {
    constructor(path, files, // LikeFile[],
    directoryHandler) {
        this.path = path;
        this.files = files;
        this.directoryHandler = directoryHandler;
        this.name = getNameByPath(path);
    }
    findDirectory(path, options) {
        return findDirectoryWithin(path, this, options);
    }
    async list() {
        return this.files.map(file => file.name);
    }
    async listFolders() {
        return this.files.filter(file => file.kind && file.kind === 'directory')
            .map(file => file.name);
    }
    async listFiles() {
        return this.files.filter(file => file.kind === 'file')
            .map(file => file.name);
    }
    async getFolders() {
        return Promise.all(this.files.filter(file => file.kind && file.kind === 'directory')
            .map(async (file) => await this.getDirectory(file.name)));
    }
    async getFiles() {
        return this.files.filter(file => file.kind === 'file')
            .map(file => new BrowserDmFileReader(file, this));
    }
    createDirectory(newPath) {
        return this.getDirectory(newPath, { create: true });
    }
    async getDirectory(newPath, options) {
        const newPathArray = newPath.split('/');
        let fullNewPath = this.path;
        let dir;
        try {
            // traverse through each folder
            dir = await newPathArray.reduce(async (last, current) => {
                const next = await last;
                const newHandle = next.getDirectoryHandle(current, options);
                const name = (await newHandle).name;
                fullNewPath = path.join(fullNewPath, name);
                return newHandle;
            }, Promise.resolve(this.directoryHandler));
        }
        catch (err) {
            throw new Error(err.message + `. ${newPath} not found in ${this.name} (${this.path})`);
        }
        const files = await directoryReadToArray(dir);
        const newDir = new BrowserDirectoryManager(fullNewPath, files, dir);
        return newDir;
    }
    removeEntry(name, options) {
        return this.directoryHandler.removeEntry(name, options);
    }
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
    }
    async file(fileName, options) {
        const findFile = await this.findFileByPath(fileName);
        if (findFile) {
            return findFile;
        }
        const fileHandle = await this.directoryHandler.getFileHandle(fileName, options);
        return new BrowserDmFileReader(fileHandle, this);
    }
    async findFileByPath(path, directoryHandler = this.directoryHandler) {
        if (!this.files.length) {
            return;
        }
        const pathSplit = path.split('/');
        const fileName = pathSplit[pathSplit.length - 1];
        // chrome we dig through the first selected directory and search the subs
        if (pathSplit.length > 1) {
            const lastParent = pathSplit.shift(); // remove index 0 of lastParent/firstParent/file.xyz
            const newHandler = await directoryHandler.getDirectoryHandle(lastParent);
            if (!newHandler) {
                console.debug('no matching upper folder', lastParent, directoryHandler);
                return;
            }
            const newPath = pathSplit.join('/');
            const dirMan = await this.getDirectory(lastParent);
            return dirMan.findFileByPath(newPath, newHandler);
        }
        let files = this.files;
        if (directoryHandler) {
            files = await directoryReadToArray(directoryHandler);
        }
        const likeFile = files.find(file => file.name === fileName);
        if (!likeFile) {
            return;
        }
        // when found, convert to File
        // const file = await this.getSystemFile(likeFile)
        return new BrowserDmFileReader(likeFile, this);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFrQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDM0ksT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUU3QixNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBR3ZELFlBQ1MsSUFBaUMsRUFDakMsU0FBMkI7UUFFbEMsS0FBSyxFQUFFLENBQUE7UUFIQSxTQUFJLEdBQUosSUFBSSxDQUE2QjtRQUNqQyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUdsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBa0I7UUFDNUIsSUFBSSxjQUFtQixDQUFBO1FBQ3ZCLE1BQU0sUUFBUSxHQUFRLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDL0IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGVBQWUsSUFBSSxNQUFNLFFBQVEsQ0FBQyxlQUFlLEVBQUUsS0FBSyxTQUFTLENBQUE7UUFFaEcsSUFBSyxhQUFhLEVBQUc7WUFDbkIsY0FBYyxHQUFHLE1BQU0sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO1NBQ2pEO2FBQU07WUFDTCx3QkFBd0I7WUFDeEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENB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RyxTQUFTLENBQUMsS0FBSyxFQUFZLENBQUEsQ0FBQyxvREFBb0Q7WUFDbkcsTUFBTSxVQUFVLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBRSxVQUFVLENBQUUsQ0FBQTtZQUUxRSxJQUFLLENBQUMsVUFBVSxFQUFHO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUN2RSxPQUFNO2FBQ1A7WUFFRCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25DLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUVsRCxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1NBQ2xEO1FBRUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUN0QixJQUFLLGdCQUFnQixFQUFHO1lBQ3RCLEtBQUssR0FBRyxNQUFNLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUE7U0FDckQ7UUFFRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQTtRQUMzRCxJQUFLLENBQUMsUUFBUSxFQUFHO1lBQ2YsT0FBTTtTQUNQO1FBRUQsOEJBQThCO1FBQzlCLGtEQUFrRDtRQUVsRCxPQUFPLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2hELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VEbUZpbGVSZWFkZXIsIERpcmVjdG9yeU1hbmFnZXIsIERtRmlsZVJlYWRlciwgZmluZERpcmVjdG9yeVdpdGhpbiwgZ2V0TmFtZUJ5UGF0aCwgcmVuYW1lRmlsZUluRGlyIH0gZnJvbSBcIi4vRGlyZWN0b3J5TWFuYWdlcnNcIlxuaW1wb3J0IHsgZGlyZWN0b3J5UmVhZFRvQXJyYXkgfSBmcm9tIFwiLi9kaXJlY3RvcnlSZWFkVG9BcnJheS5mdW5jdGlvblwiXG5pbXBvcnQgeyBwYXRoIH0gZnJvbSBcIi4vcGF0aFwiXG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyRG1GaWxlUmVhZGVyIGV4dGVuZHMgQmFzZURtRmlsZVJlYWRlciBpbXBsZW1lbnRzIERtRmlsZVJlYWRlciB7XG4gIG5hbWU6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBmaWxlOiBGaWxlIHwgRmlsZVN5c3RlbUZpbGVIYW5kbGUsXG4gICAgcHVibGljIGRpcmVjdG9yeTogRGlyZWN0b3J5TWFuYWdlclxuICApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5uYW1lID0gZmlsZS5uYW1lXG4gIH1cblxuICBhc3luYyBzdGF0cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWFsRmlsZSgpXG4gIH1cblxuICBhc3luYyB3cml0ZShmaWxlU3RyaW5nOiBzdHJpbmcpIHtcbiAgICBsZXQgd3JpdGFibGVTdHJlYW06IGFueVxuICAgIGNvbnN0IGxpa2VGaWxlOiBhbnkgPSB0aGlzLmZpbGVcbiAgICBjb25zdCBoYXNQZXJtaXNzaW9uID0gbGlrZUZpbGUucXVlcnlQZXJtaXNzaW9uICYmIGF3YWl0IGxpa2VGaWxlLnF1ZXJ5UGVybWlzc2lvbigpID09PSAnZ3JhbnRlZCdcblxuICAgIGlmICggaGFzUGVybWlzc2lvbiApIHtcbiAgICAgIHdyaXRhYmxlU3RyZWFtID0gYXdhaXQgbGlrZUZpbGUuY3JlYXRlV3JpdGFibGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXF1ZXN0IHdoZXJlIHRvIHNhdmVcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCctJykrJy1maWxlUGlja2VyJ1xuICAgICAgY29uc3Qgc2F2ZVBpY2tlck9wdGlvbnMgPSB7XG4gICAgICAgIHN1Z2dlc3RlZE5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgLyp0eXBlczogW3tcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0pTT04nLFxuICAgICAgICAgIGFjY2VwdDoge1xuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBbJy5qc29uJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfV0sKi9cbiAgICAgIH1cblxuICAgICAgLy8gYmVsb3csIHRob3VnaHQgdG8gcmVtZW1iZXIgbGFzdCBtYXRjaGluZyBmaWxlIChpIHRoaW5rIGRhdGEgdHlwaW5nIGlzIGp1c3QgbWlzc2luZyBmb3IgaXQpXG4gICAgICA7KHNhdmVQaWNrZXJPcHRpb25zIGFzIGFueSkuaWQgPSBpZC5zbGljZSgwLCAzMilcblxuICAgICAgY29uc3QgaGFuZGxlID0gYXdhaXQgd2luZG93LnNob3dTYXZlRmlsZVBpY2tlcihzYXZlUGlja2VyT3B0aW9ucylcbiAgICAgIFxuICAgICAgd3JpdGFibGVTdHJlYW0gPSBhd2FpdCBoYW5kbGUuY3JlYXRlV3JpdGFibGUoKVxuICAgIH1cblxuXG4gICAgLy8gd3JpdGUgb3VyIGZpbGVcbiAgICBhd2FpdCB3cml0YWJsZVN0cmVhbS53cml0ZSggZmlsZVN0cmluZyApXG5cbiAgICAvLyBjbG9zZSB0aGUgZmlsZSBhbmQgd3JpdGUgdGhlIGNvbnRlbnRzIHRvIGRpc2suXG4gICAgYXdhaXQgd3JpdGFibGVTdHJlYW0uY2xvc2UoKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRSZWFsRmlsZSgpOiBQcm9taXNlPEZpbGU+IHtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlIGFzIGFueVxuICAgIHJldHVybiBmaWxlLmdldEZpbGUgPyBhd2FpdCBmaWxlLmdldEZpbGUoKSA6IFByb21pc2UucmVzb2x2ZShmaWxlKVxuICB9XG4gIFxuICBvdmVycmlkZSByZWFkQXNUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXMsIHJlaikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuZ2V0UmVhbEZpbGUoKVxuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKVxuICAgICAgICByZWFkZXIub25sb2FkID0gKCkgPT4gcmVzKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJlaihlcnIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJlYWRBc0RhdGFVUkwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlcywgcmVqKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRSZWFsRmlsZSgpXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXMocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVqKGVycilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBuYW1lOiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nLFxuICAgIHB1YmxpYyBmaWxlczogRmlsZVN5c3RlbUZpbGVIYW5kbGVbXSwgLy8gTGlrZUZpbGVbXSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5SGFuZGxlcjogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSxcbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gZ2V0TmFtZUJ5UGF0aChwYXRoKVxuICB9XG5cbiAgZmluZERpcmVjdG9yeSAoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9ucyxcbiAgKTogUHJvbWlzZTxEaXJlY3RvcnlNYW5hZ2VyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIGZpbmREaXJlY3RvcnlXaXRoaW4ocGF0aCwgdGhpcywgb3B0aW9ucylcbiAgfVxuICBcbiAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZXMubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG4gIFxuICBhc3luYyBsaXN0Rm9sZGVycygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS5raW5kICYmIChmaWxlIGFzIGFueSkua2luZCA9PT0gJ2RpcmVjdG9yeScpXG4gICAgICAubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG4gIFxuICBhc3luYyBsaXN0RmlsZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUua2luZCA9PT0gJ2ZpbGUnKVxuICAgICAgLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgZ2V0Rm9sZGVycygpOiBQcm9taXNlPEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyW10+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUua2luZCAmJiAoZmlsZSBhcyBhbnkpLmtpbmQgPT09ICdkaXJlY3RvcnknKVxuICAgICAgICAubWFwKGFzeW5jIGZpbGUgPT4gYXdhaXQgdGhpcy5nZXREaXJlY3RvcnkoZmlsZS5uYW1lKSlcbiAgICApXG4gIH1cbiAgXG4gIGFzeW5jIGdldEZpbGVzKCk6IFByb21pc2U8RG1GaWxlUmVhZGVyW10+IHtcbiAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoZmlsZSA9PiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlLCB0aGlzKSlcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeShuZXdQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREaXJlY3RvcnkobmV3UGF0aCwgeyBjcmVhdGU6IHRydWUgfSlcbiAgfVxuXG4gIGFzeW5jIGdldERpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zXG4gICk6IFByb21pc2U8QnJvd3NlckRpcmVjdG9yeU1hbmFnZXI+IHtcbiAgICBjb25zdCBuZXdQYXRoQXJyYXkgPSBuZXdQYXRoLnNwbGl0KCcvJylcbiAgICBsZXQgZnVsbE5ld1BhdGggPSB0aGlzLnBhdGhcbiAgICBsZXQgZGlyOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlXG5cbiAgICB0cnkge1xuICAgICAgLy8gdHJhdmVyc2UgdGhyb3VnaCBlYWNoIGZvbGRlclxuICAgICAgZGlyICA9IGF3YWl0IG5ld1BhdGhBcnJheS5yZWR1Y2UoYXN5bmMgKGxhc3QsY3VycmVudCkgPT4ge1xuICAgICAgICBjb25zdCBuZXh0OiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlID0gYXdhaXQgbGFzdFxuICAgICAgICBjb25zdCBuZXdIYW5kbGUgPSBuZXh0LmdldERpcmVjdG9yeUhhbmRsZShjdXJyZW50LCBvcHRpb25zKVxuICAgICAgICBjb25zdCBuYW1lID0gKGF3YWl0IG5ld0hhbmRsZSkubmFtZVxuICAgICAgICBmdWxsTmV3UGF0aCA9IHBhdGguam9pbihmdWxsTmV3UGF0aCwgbmFtZSlcbiAgICAgICAgcmV0dXJuIG5ld0hhbmRsZVxuICAgICAgfSwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuZGlyZWN0b3J5SGFuZGxlcikpXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnIubWVzc2FnZSArIGAuICR7bmV3UGF0aH0gbm90IGZvdW5kIGluICR7dGhpcy5uYW1lfSAoJHt0aGlzLnBhdGh9KWApXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZXM6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlW10gPSBhd2FpdCBkaXJlY3RvcnlSZWFkVG9BcnJheShkaXIpXG4gICAgY29uc3QgbmV3RGlyID0gbmV3IEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyKFxuICAgICAgZnVsbE5ld1BhdGgsXG4gICAgICBmaWxlcyxcbiAgICAgIGRpclxuICAgIClcbiAgICByZXR1cm4gbmV3RGlyXG4gIH1cblxuICByZW1vdmVFbnRyeShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHsgcmVjdXJzaXZlOiBib29sZWFuIH1cbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0b3J5SGFuZGxlci5yZW1vdmVFbnRyeShuYW1lLCBvcHRpb25zKVxuICB9XG5cbiAgYXN5bmMgcmVuYW1lRmlsZShcbiAgICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICAgIG5ld0ZpbGVOYW1lOiBzdHJpbmdcbiAgKSB7XG4gICAgcmV0dXJuIHJlbmFtZUZpbGVJbkRpcihvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaWxlKGZpbGVOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RmlsZU9wdGlvbnMpIHtcbiAgICBjb25zdCBmaW5kRmlsZSA9IGF3YWl0IHRoaXMuZmluZEZpbGVCeVBhdGgoZmlsZU5hbWUpXG5cbiAgICBpZiAoIGZpbmRGaWxlICkge1xuICAgICAgcmV0dXJuIGZpbmRGaWxlXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZUhhbmRsZSA9IGF3YWl0IHRoaXMuZGlyZWN0b3J5SGFuZGxlci5nZXRGaWxlSGFuZGxlKGZpbGVOYW1lLCBvcHRpb25zKVxuICAgIHJldHVybiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlSGFuZGxlLCB0aGlzKVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGgoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGRpcmVjdG9yeUhhbmRsZXI6IGFueSA9IHRoaXMuZGlyZWN0b3J5SGFuZGxlcixcbiAgKTogUHJvbWlzZTxCcm93c2VyRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKCAhdGhpcy5maWxlcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGhTcGxpdFsgcGF0aFNwbGl0Lmxlbmd0aC0xIF1cblxuICAgIC8vIGNocm9tZSB3ZSBkaWcgdGhyb3VnaCB0aGUgZmlyc3Qgc2VsZWN0ZWQgZGlyZWN0b3J5IGFuZCBzZWFyY2ggdGhlIHN1YnNcbiAgICBpZiAoIHBhdGhTcGxpdC5sZW5ndGggPiAxICkge1xuICAgICAgY29uc3QgbGFzdFBhcmVudCA9IHBhdGhTcGxpdC5zaGlmdCgpIGFzIHN0cmluZyAvLyByZW1vdmUgaW5kZXggMCBvZiBsYXN0UGFyZW50L2ZpcnN0UGFyZW50L2ZpbGUueHl6XG4gICAgICBjb25zdCBuZXdIYW5kbGVyID0gYXdhaXQgZGlyZWN0b3J5SGFuZGxlci5nZXREaXJlY3RvcnlIYW5kbGUoIGxhc3RQYXJlbnQgKVxuICAgICAgXG4gICAgICBpZiAoICFuZXdIYW5kbGVyICkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdubyBtYXRjaGluZyB1cHBlciBmb2xkZXInLCBsYXN0UGFyZW50LCBkaXJlY3RvcnlIYW5kbGVyKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3UGF0aCA9IHBhdGhTcGxpdC5qb2luKCcvJylcbiAgICAgIGNvbnN0IGRpck1hbiA9IGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KGxhc3RQYXJlbnQpXG4gICAgICBcbiAgICAgIHJldHVybiBkaXJNYW4uZmluZEZpbGVCeVBhdGgobmV3UGF0aCwgbmV3SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgbGV0IGZpbGVzID0gdGhpcy5maWxlc1xuICAgIGlmICggZGlyZWN0b3J5SGFuZGxlciApIHtcbiAgICAgIGZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyZWN0b3J5SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbGlrZUZpbGUgPSBmaWxlcy5maW5kKGZpbGUgPT4gZmlsZS5uYW1lID09PSBmaWxlTmFtZSlcbiAgICBpZiAoICFsaWtlRmlsZSApIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBcbiAgICAvLyB3aGVuIGZvdW5kLCBjb252ZXJ0IHRvIEZpbGVcbiAgICAvLyBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRTeXN0ZW1GaWxlKGxpa2VGaWxlKVxuICAgIFxuICAgIHJldHVybiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihsaWtlRmlsZSwgdGhpcylcbiAgfVxufVxuIl19