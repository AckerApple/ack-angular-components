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
            .map(file => file.name);
    }
    async getFiles() {
        return this.files.filter(file => file.kind === 'file')
            .map(file => new BrowserDmFileReader(file, this));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFrQyxNQUFNLHFCQUFxQixDQUFBO0FBQ3RGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0IsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGdCQUFnQjtJQUd2RCxZQUNTLElBQWlDLEVBQ2pDLFNBQTJCO1FBRWxDLEtBQUssRUFBRSxDQUFBO1FBSEEsU0FBSSxHQUFKLElBQUksQ0FBNkI7UUFDakMsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFHbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQWtCO1FBQzVCLElBQUksY0FBbUIsQ0FBQTtRQUN2QixNQUFNLFFBQVEsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQy9CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxlQUFlLElBQUksTUFBTSxRQUFRLENBQUMsZUFBZSxFQUFFLEtBQUssU0FBUyxDQUFBO1FBRWhHLElBQUssYUFBYSxFQUFHO1lBQ25CLGNBQWMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtTQUNqRDthQUFNO1lBQ0wsd0JBQXdCO1lBQ3hCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBQyxHQUFHLENBQUMsR0FBQyxhQUFhLENBQUE7WUFDL0QsTUFBTSxpQkFBaUIsR0FBRztnQkFDeEIsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUN4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QUssUUFBUSxDQUFDLENBQUE7UUFDM0QsSUFBSyxDQUFDLFFBQVEsRUFBRztZQUNmLE9BQU07U0FDUDtRQUVELDhCQUE4QjtRQUM5QixrREFBa0Q7UUFFbEQsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlRG1GaWxlUmVhZGVyLCBEaXJlY3RvcnlNYW5hZ2VyLCBEbUZpbGVSZWFkZXIgfSBmcm9tIFwiLi9EaXJlY3RvcnlNYW5hZ2Vyc1wiXG5pbXBvcnQgeyBkaXJlY3RvcnlSZWFkVG9BcnJheSB9IGZyb20gXCIuL2RpcmVjdG9yeVJlYWRUb0FycmF5LmZ1bmN0aW9uXCJcbmltcG9ydCB7IHBhdGggfSBmcm9tIFwiLi9wYXRoXCJcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEbUZpbGVSZWFkZXIgZXh0ZW5kcyBCYXNlRG1GaWxlUmVhZGVyIGltcGxlbWVudHMgRG1GaWxlUmVhZGVyIHtcbiAgbmFtZTogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGU6IEZpbGUgfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5OiBEaXJlY3RvcnlNYW5hZ2VyXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm5hbWUgPSBmaWxlLm5hbWVcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGZpbGVTdHJpbmc6IHN0cmluZykge1xuICAgIGxldCB3cml0YWJsZVN0cmVhbTogYW55XG4gICAgY29uc3QgbGlrZUZpbGU6IGFueSA9IHRoaXMuZmlsZVxuICAgIGNvbnN0IGhhc1Blcm1pc3Npb24gPSBsaWtlRmlsZS5xdWVyeVBlcm1pc3Npb24gJiYgYXdhaXQgbGlrZUZpbGUucXVlcnlQZXJtaXNzaW9uKCkgPT09ICdncmFudGVkJ1xuXG4gICAgaWYgKCBoYXNQZXJtaXNzaW9uICkge1xuICAgICAgd3JpdGFibGVTdHJlYW0gPSBhd2FpdCBsaWtlRmlsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlcXVlc3Qgd2hlcmUgdG8gc2F2ZVxuICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csJy0nKSsnLWZpbGVQaWNrZXInXG4gICAgICBjb25zdCBzYXZlUGlja2VyT3B0aW9ucyA9IHtcbiAgICAgICAgc3VnZ2VzdGVkTmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAvKnR5cGVzOiBbe1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSlNPTicsXG4gICAgICAgICAgYWNjZXB0OiB7XG4gICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IFsnLmpzb24nXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XSwqL1xuICAgICAgfVxuXG4gICAgICAvLyBiZWxvdywgdGhvdWdodCB0byByZW1lbWJlciBsYXN0IG1hdGNoaW5nIGZpbGUgKGkgdGhpbmsgZGF0YSB0eXBpbmcgaXMganVzdCBtaXNzaW5nIGZvciBpdClcbiAgICAgIDsoc2F2ZVBpY2tlck9wdGlvbnMgYXMgYW55KS5pZCA9IGlkLnNsaWNlKDAsIDMyKVxuXG4gICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyKHNhdmVQaWNrZXJPcHRpb25zKVxuICAgICAgXG4gICAgICB3cml0YWJsZVN0cmVhbSA9IGF3YWl0IGhhbmRsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfVxuXG5cbiAgICAvLyB3cml0ZSBvdXIgZmlsZVxuICAgIGF3YWl0IHdyaXRhYmxlU3RyZWFtLndyaXRlKCBmaWxlU3RyaW5nIClcblxuICAgIC8vIGNsb3NlIHRoZSBmaWxlIGFuZCB3cml0ZSB0aGUgY29udGVudHMgdG8gZGlzay5cbiAgICBhd2FpdCB3cml0YWJsZVN0cmVhbS5jbG9zZSgpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldFJlYWRGaWxlKCk6IFByb21pc2U8RmlsZT4ge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGUgYXMgYW55XG4gICAgcmV0dXJuIGZpbGUuZ2V0RmlsZSA/IGF3YWl0IGZpbGUuZ2V0RmlsZSgpIDogUHJvbWlzZS5yZXNvbHZlKGZpbGUpXG4gIH1cbiAgXG4gIG92ZXJyaWRlIHJlYWRBc1RleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlcywgcmVqKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRSZWFkRmlsZSgpXG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXMocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVqKGVycilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nLFxuICAgIHB1YmxpYyBmaWxlczogRmlsZVN5c3RlbUZpbGVIYW5kbGVbXSwgLy8gTGlrZUZpbGVbXSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5SGFuZGxlcjogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSxcbiAgKSB7fVxuXG4gIGFzeW5jIGxpc3QoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgbGlzdEZvbGRlcnMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUua2luZCAmJiAoZmlsZSBhcyBhbnkpLmtpbmQgPT09ICdkaXJlY3RvcnknKVxuICAgICAgLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgbGlzdEZpbGVzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoZmlsZSA9PiBmaWxlLm5hbWUpXG4gIH1cbiAgXG4gIGFzeW5jIGdldEZpbGVzKCk6IFByb21pc2U8RG1GaWxlUmVhZGVyW10+IHtcbiAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoZmlsZSA9PiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlLCB0aGlzKSlcbiAgfVxuXG4gIGFzeW5jIGdldERpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zXG4gICkge1xuICAgIGNvbnN0IG5ld1BhdGhBcnJheSA9IG5ld1BhdGguc3BsaXQoJy8nKVxuICAgIFxuICAgIC8vIHRyYXZlcnNlIHRocm91Z2ggZWFjaCBmb2xkZXJcbiAgICBjb25zdCBkaXI6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBuZXdQYXRoQXJyYXkucmVkdWNlKGFzeW5jIChsYXN0LGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQ6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBsYXN0XG4gICAgICBjb25zdCBuZXdIYW5kbGUgPSBuZXh0LmdldERpcmVjdG9yeUhhbmRsZShjdXJyZW50LCBvcHRpb25zKVxuICAgICAgcmV0dXJuIG5ld0hhbmRsZVxuICAgIH0sIFByb21pc2UucmVzb2x2ZSh0aGlzLmRpcmVjdG9yeUhhbmRsZXIpKVxuICAgIFxuICAgIGNvbnN0IGZpbGVzOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVtdID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyKVxuICAgIGNvbnN0IGZ1bGxOZXdQYXRoID0gcGF0aC5qb2luKHRoaXMucGF0aCwgbmV3UGF0aClcbiAgICBjb25zdCBuZXdEaXIgPSBuZXcgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXIoXG4gICAgICBmdWxsTmV3UGF0aCxcbiAgICAgIGZpbGVzLFxuICAgICAgZGlyXG4gICAgKVxuICAgIHJldHVybiBuZXdEaXJcbiAgfVxuXG4gIGFzeW5jIGZpbGUoZmlsZU5hbWU6IHN0cmluZywgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXRGaWxlT3B0aW9ucykge1xuICAgIGNvbnN0IGZpbmRGaWxlID0gYXdhaXQgdGhpcy5maW5kRmlsZUJ5UGF0aChmaWxlTmFtZSlcblxuICAgIGlmICggZmluZEZpbGUgKSB7XG4gICAgICByZXR1cm4gZmluZEZpbGVcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgdGhpcy5kaXJlY3RvcnlIYW5kbGVyLmdldEZpbGVIYW5kbGUoZmlsZU5hbWUsIG9wdGlvbnMpXG4gICAgcmV0dXJuIG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGVIYW5kbGUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaW5kRmlsZUJ5UGF0aChcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgZGlyZWN0b3J5SGFuZGxlcjogYW55ID0gdGhpcy5kaXJlY3RvcnlIYW5kbGVyLFxuICApOiBQcm9taXNlPEJyb3dzZXJEbUZpbGVSZWFkZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGhTcGxpdFsgcGF0aFNwbGl0Lmxlbmd0aC0xIF1cbiAgICBpZiAoICF0aGlzLmZpbGVzLmxlbmd0aCApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGNocm9tZSB3ZSBkaWcgdGhyb3VnaCB0aGUgZmlyc3Qgc2VsZWN0ZWQgZGlyZWN0b3J5IGFuZCBzZWFyY2ggdGhlIHN1YnNcbiAgICBpZiAoIHBhdGhTcGxpdC5sZW5ndGggPiAxICkge1xuICAgICAgY29uc3QgbGFzdFBhcmVudCA9IHBhdGhTcGxpdC5zaGlmdCgpIGFzIHN0cmluZyAvLyByZW1vdmUgaW5kZXggMCBvZiBsYXN0UGFyZW50L2ZpcnN0UGFyZW50L2ZpbGUueHl6XG4gICAgICBjb25zdCBuZXdIYW5kbGVyID0gYXdhaXQgZGlyZWN0b3J5SGFuZGxlci5nZXREaXJlY3RvcnlIYW5kbGUoIGxhc3RQYXJlbnQgKVxuICAgICAgXG4gICAgICBpZiAoICFuZXdIYW5kbGVyICkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdubyBtYXRjaGluZyB1cHBlciBmb2xkZXInLCBsYXN0UGFyZW50LCBkaXJlY3RvcnlIYW5kbGVyKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3UGF0aCA9IHBhdGhTcGxpdC5qb2luKCcvJylcbiAgICAgIGNvbnN0IGRpck1hbiA9IGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KGxhc3RQYXJlbnQpXG4gICAgICBcbiAgICAgIHJldHVybiBkaXJNYW4uZmluZEZpbGVCeVBhdGgobmV3UGF0aCwgbmV3SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgbGV0IGZpbGVzID0gdGhpcy5maWxlc1xuICAgIGlmICggZGlyZWN0b3J5SGFuZGxlciApIHtcbiAgICAgIGZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyZWN0b3J5SGFuZGxlcilcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbGlrZUZpbGUgPSBmaWxlcy5maW5kKGZpbGUgPT4gZmlsZS5uYW1lID09PSBmaWxlTmFtZSlcbiAgICBpZiAoICFsaWtlRmlsZSApIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBcbiAgICAvLyB3aGVuIGZvdW5kLCBjb252ZXJ0IHRvIEZpbGVcbiAgICAvLyBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRTeXN0ZW1GaWxlKGxpa2VGaWxlKVxuICAgIFxuICAgIHJldHVybiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihsaWtlRmlsZSwgdGhpcylcbiAgfVxufVxuIl19