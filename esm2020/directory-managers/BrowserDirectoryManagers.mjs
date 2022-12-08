import { BaseDmFileReader } from "./DirectoryManagers";
import { directoryReadToArray } from "./directoryReadToArray.function";
import { path } from "./path";
export class BrowserDmFileReader extends BaseDmFileReader {
    constructor(file, directory) {
        super();
        this.file = file;
        this.directory = directory;
        this.name = file.name;
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
    async getReadFile() {
        const file = this.file;
        return file.getFile ? await file.getFile() : Promise.resolve(file);
    }
    readAsText() {
        return new Promise(async (res, rej) => {
            try {
                var reader = new FileReader();
                const file = await this.getReadFile();
                reader.readAsText(file);
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
            .map(file => new BrowserDmFileReader(file, this));
        /*
        const filePromises: Promise<FileSystemFileHandle>[] = this.files
          .filter(file => file.kind === 'file')
          .map(async file => this.getSystemFile(file))
        
        return (await Promise.all(filePromises))
          .map(file => new BrowserDmFileReader(file))
        */
    }
    async getDirectory(newPath, options) {
        const newPathArray = newPath.split('/');
        // traverse through each folder
        const dir = await newPathArray.reduce(async (last, current) => {
            const next = await last;
            const newHandle = next.getDirectoryHandle(current, options);
            return newHandle;
        }, Promise.resolve(this.directoryHandler));
        const files = await directoryReadToArray(dir);
        const fullNewPath = path.join(this.path, newPath);
        const newDir = new BrowserDirectoryManager(fullNewPath, files, dir);
        return newDir;
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
        const pathSplit = path.split('/');
        const fileName = pathSplit[pathSplit.length - 1];
        if (!this.files.length) {
            return;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFrQyxNQUFNLHFCQUFxQixDQUFBO0FBQ3RGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0IsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGdCQUFnQjtJQUd2RCxZQUNTLElBQWlDLEVBQ2pDLFNBQTJCO1FBRWxDLEtBQUssRUFBRSxDQUFBO1FBSEEsU0FBSSxHQUFKLElBQUksQ0FBNkI7UUFDakMsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFHbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQWtCO1FBQzVCLElBQUksY0FBbUIsQ0FBQTtRQUN2QixNQUFNLFFBQVEsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQy9CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxlQUFlLElBQUksTUFBTSxRQUFRLENBQUMsZUFBZSxFQUFFLEtBQUssU0FBUyxDQUFBO1FBRWhHLElBQUssYUFBYSxFQUFHO1lBQ25CLGNBQWMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtTQUNqRDthQUFNO1lBQ0wsd0JBQXdCO1lBQ3hCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBQyxHQUFHLENBQUMsR0FBQyxhQUFhLENBQUE7WUFDL0QsTUFBTSxpQkFBaUIsR0FBRztnQkFDeEIsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUN4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ZW50IjpbImltcG9ydCB7IEJhc2VEbUZpbGVSZWFkZXIsIERpcmVjdG9yeU1hbmFnZXIsIERtRmlsZVJlYWRlciB9IGZyb20gXCIuL0RpcmVjdG9yeU1hbmFnZXJzXCJcbmltcG9ydCB7IGRpcmVjdG9yeVJlYWRUb0FycmF5IH0gZnJvbSBcIi4vZGlyZWN0b3J5UmVhZFRvQXJyYXkuZnVuY3Rpb25cIlxuaW1wb3J0IHsgcGF0aCB9IGZyb20gXCIuL3BhdGhcIlxuXG5leHBvcnQgY2xhc3MgQnJvd3NlckRtRmlsZVJlYWRlciBleHRlbmRzIEJhc2VEbUZpbGVSZWFkZXIgaW1wbGVtZW50cyBEbUZpbGVSZWFkZXIge1xuICBuYW1lOiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZmlsZTogRmlsZSB8IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLFxuICAgIHB1YmxpYyBkaXJlY3Rvcnk6IERpcmVjdG9yeU1hbmFnZXJcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubmFtZSA9IGZpbGUubmFtZVxuICB9XG5cbiAgYXN5bmMgd3JpdGUoZmlsZVN0cmluZzogc3RyaW5nKSB7XG4gICAgbGV0IHdyaXRhYmxlU3RyZWFtOiBhbnlcbiAgICBjb25zdCBsaWtlRmlsZTogYW55ID0gdGhpcy5maWxlXG4gICAgY29uc3QgaGFzUGVybWlzc2lvbiA9IGxpa2VGaWxlLnF1ZXJ5UGVybWlzc2lvbiAmJiBhd2FpdCBsaWtlRmlsZS5xdWVyeVBlcm1pc3Npb24oKSA9PT0gJ2dyYW50ZWQnXG5cbiAgICBpZiAoIGhhc1Blcm1pc3Npb24gKSB7XG4gICAgICB3cml0YWJsZVN0cmVhbSA9IGF3YWl0IGxpa2VGaWxlLmNyZWF0ZVdyaXRhYmxlKClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcmVxdWVzdCB3aGVyZSB0byBzYXZlXG4gICAgICBjb25zdCBpZCA9IHRoaXMubmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywnLScpKyctZmlsZVBpY2tlcidcbiAgICAgIGNvbnN0IHNhdmVQaWNrZXJPcHRpb25zID0ge1xuICAgICAgICBzdWdnZXN0ZWROYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIC8qdHlwZXM6IFt7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdKU09OJyxcbiAgICAgICAgICBhY2NlcHQ6IHtcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogWycuanNvbiddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1dLCovXG4gICAgICB9XG5cbiAgICAgIC8vIGJlbG93LCB0aG91Z2h0IHRvIHJlbWVtYmVyIGxhc3QgbWF0Y2hpbmcgZmlsZSAoaSB0aGluayBkYXRhIHR5cGluZyBpcyBqdXN0IG1pc3NpbmcgZm9yIGl0KVxuICAgICAgOyhzYXZlUGlja2VyT3B0aW9ucyBhcyBhbnkpLmlkID0gaWQuc2xpY2UoMCwgMzIpXG5cbiAgICAgIGNvbnN0IGhhbmRsZSA9IGF3YWl0IHdpbmRvdy5zaG93U2F2ZUZpbGVQaWNrZXIoc2F2ZVBpY2tlck9wdGlvbnMpXG4gICAgICBcbiAgICAgIHdyaXRhYmxlU3RyZWFtID0gYXdhaXQgaGFuZGxlLmNyZWF0ZVdyaXRhYmxlKClcbiAgICB9XG5cblxuICAgIC8vIHdyaXRlIG91ciBmaWxlXG4gICAgYXdhaXQgd3JpdGFibGVTdHJlYW0ud3JpdGUoIGZpbGVTdHJpbmcgKVxuXG4gICAgLy8gY2xvc2UgdGhlIGZpbGUgYW5kIHdyaXRlIHRoZSBjb250ZW50cyB0byBkaXNrLlxuICAgIGF3YWl0IHdyaXRhYmxlU3RyZWFtLmNsb3NlKClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0UmVhZEZpbGUoKTogUHJvbWlzZTxGaWxlPiB7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuZmlsZSBhcyBhbnlcbiAgICByZXR1cm4gZmlsZS5nZXRGaWxlID8gYXdhaXQgZmlsZS5nZXRGaWxlKCkgOiBQcm9taXNlLnJlc29sdmUoZmlsZSlcbiAgfVxuICBcbiAgb3ZlcnJpZGUgcmVhZEFzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzLCByZWopID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmdldFJlYWRGaWxlKClcbiAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSlcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9ICgpID0+IHJlcyhyZWFkZXIucmVzdWx0IGFzIHN0cmluZylcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZWooZXJyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyIGltcGxlbWVudHMgRGlyZWN0b3J5TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXRoOiBzdHJpbmcsXG4gICAgcHVibGljIGZpbGVzOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVtdLCAvLyBMaWtlRmlsZVtdLFxuICAgIHB1YmxpYyBkaXJlY3RvcnlIYW5kbGVyOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLFxuICApIHt9XG5cbiAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZXMubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG4gIFxuICBhc3luYyBsaXN0Rm9sZGVycygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS5raW5kICYmIChmaWxlIGFzIGFueSkua2luZCA9PT0gJ2RpcmVjdG9yeScpXG4gICAgICAubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG4gIFxuICBhc3luYyBsaXN0RmlsZXMoKTogUHJvbWlzZTxEbUZpbGVSZWFkZXJbXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUua2luZCA9PT0gJ2ZpbGUnKVxuICAgICAgLm1hcChmaWxlID0+IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUsIHRoaXMpKVxuICAgIC8qXG4gICAgY29uc3QgZmlsZVByb21pc2VzOiBQcm9taXNlPEZpbGVTeXN0ZW1GaWxlSGFuZGxlPltdID0gdGhpcy5maWxlc1xuICAgICAgLmZpbHRlcihmaWxlID0+IGZpbGUua2luZCA9PT0gJ2ZpbGUnKVxuICAgICAgLm1hcChhc3luYyBmaWxlID0+IHRoaXMuZ2V0U3lzdGVtRmlsZShmaWxlKSlcbiAgICBcbiAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKGZpbGVQcm9taXNlcykpXG4gICAgICAubWFwKGZpbGUgPT4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIoZmlsZSkpXG4gICAgKi9cbiAgfVxuXG4gIGFzeW5jIGdldERpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zXG4gICkge1xuICAgIGNvbnN0IG5ld1BhdGhBcnJheSA9IG5ld1BhdGguc3BsaXQoJy8nKVxuICAgIFxuICAgIC8vIHRyYXZlcnNlIHRocm91Z2ggZWFjaCBmb2xkZXJcbiAgICBjb25zdCBkaXI6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBuZXdQYXRoQXJyYXkucmVkdWNlKGFzeW5jIChsYXN0LGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQ6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBsYXN0XG4gICAgICBjb25zdCBuZXdIYW5kbGUgPSBuZXh0LmdldERpcmVjdG9yeUhhbmRsZShjdXJyZW50LCBvcHRpb25zKVxuICAgICAgcmV0dXJuIG5ld0hhbmRsZVxuICAgIH0sIFByb21pc2UucmVzb2x2ZSh0aGlzLmRpcmVjdG9yeUhhbmRsZXIpKVxuICAgIFxuICAgIGNvbnN0IGZpbGVzOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVtdID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyKVxuICAgIGNvbnN0IGZ1bGxOZXdQYXRoID0gcGF0aC5qb2luKHRoaXMucGF0aCwgbmV3UGF0aClcbiAgICBjb25zdCBuZXdEaXIgPSBuZXcgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXIoXG4gICAgICBmdWxsTmV3UGF0aCxcbiAgICAgIGZpbGVzLFxuICAgICAgZGlyXG4gICAgKVxuICAgIHJldHVybiBuZXdEaXJcbiAgfVxuXG4gIGFzeW5jIGZpbGUoZmlsZU5hbWU6IHN0cmluZywgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXRGaWxlT3B0aW9ucykge1xuICAgIGNvbnN0IGZpbmRGaWxlID0gYXdhaXQgdGhpcy5maW5kRmlsZUJ5UGF0aChmaWxlTmFtZSlcblxuICAgIGlmICggZmluZEZpbGUgKSB7XG4gICAgICByZXR1cm4gZmluZEZpbGVcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgdGhpcy5kaXJlY3RvcnlIYW5kbGVyLmdldEZpbGVIYW5kbGUoZmlsZU5hbWUsIG9wdGlvbnMpXG4gICAgcmV0dXJuIG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGVIYW5kbGUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaW5kRmlsZUJ5UGF0aChcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgZGlyZWN0b3J5SGFuZGxlcjogYW55ID0gdGhpcy5kaXJlY3RvcnlIYW5kbGVyLFxuICApOiBQcm9taXNlPEJyb3dzZXJEbUZpbGVSZWFkZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGhTcGxpdFsgcGF0aFNwbGl0Lmxlbmd0aC0xIF1cbiAgICBpZiAoICF0aGlzLmZpbGVzLmxlbmd0aCApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGNocm9tZSB3ZSBkaWcgdGhyb3VnaCB0aGUgZmlyc3Qgc2VsZWN0ZWQgZGlyZWN0b3J5IGFuZCBzZWFyY2ggdGhlIHN1YnNcbiAgICBpZiAoIHBhdGhTcGxpdC5sZW5ndGggPiAxICkge1xuICAgICAgY29uc3QgbGFzdFBhcmVudCA9IHBhdGhTcGxpdC5zaGlmdCgpIGFzIHN0cmluZyAvLyByZW1vdmUgaW5kZXggMCBvZiBsYXN0UGFyZW50L2ZpcnN0UGFyZW50L2ZpbGUueHl6XG4gICAgICBjb25zdCBuZXdIYW5kbGVyID0gYXdhaXQgZGlyZWN0b3J5SGFuZGxlci5nZXREaXJlY3RvcnlIYW5kbGUoIGxhc3RQYXJlbnQgKVxuICAgICAgXG4gICAgICBpZiAoICFuZXdIYW5kbGVyICkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdubyBtYXRjaGluZyB1cHBlciBmb2xkZXInLCBsYXN0UGFyZW50LCBkaXJlY3RvcnlIYW5kbGVyKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3UGF0aCA9IHBhdGhTcGxpdC5qb2luKCcvJylcbiAgICAgIGNvbnN0IGRpck1hbiA9IGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KGxhc3RQYXJlbnQpXG4gICAgICBcbiAgICAgIHJldHVybiBkaXJNYW4uZmluZEZpbGVCeVBhdGgobmV3UGF0aCwgbmV3SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgbGV0IGZpbGVzID0gdGhpcy5maWxlc1xuICAgIGlmICggZGlyZWN0b3J5SGFuZGxlciApIHtcbiAgICAgIGZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyZWN0b3J5SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbGlrZUZpbGUgPSBmaWxlcy5maW5kKGZpbGUgPT4gZmlsZS5uYW1lID09PSBmaWxlTmFtZSlcbiAgICBpZiAoICFsaWtlRmlsZSApIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBcbiAgICAvLyB3aGVuIGZvdW5kLCBjb252ZXJ0IHRvIEZpbGVcbiAgICAvLyBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRTeXN0ZW1GaWxlKGxpa2VGaWxlKVxuICAgIFxuICAgIHJldHVybiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihsaWtlRmlsZSwgdGhpcylcbiAgfVxufVxuIl19