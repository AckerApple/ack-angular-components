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
    /*
    private getSystemFile(
      file: FileSystemFileHandle
    ): Promise<FileSystemFileHandle> {
      return Promise.resolve(file)
      
      // load browser file WITH connected permissions
      //return this.directoryHandler.getFileHandle(file.name)
      
      // load browser file but with no connected permissions
      // return file.getFile ? await file.getFile() : file as any
    }*/
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFrQyxNQUFNLHFCQUFxQixDQUFBO0FBQ3RGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0IsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGdCQUFnQjtJQUd2RCxZQUNTLElBQWlDLEVBQ2pDLFNBQTJCO1FBRWxDLEtBQUssRUFBRSxDQUFBO1FBSEEsU0FBSSxHQUFKLElBQUksQ0FBNkI7UUFDakMsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFHbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQWtCO1FBQzVCLElBQUksY0FBbUIsQ0FBQTtRQUN2QixNQUFNLFFBQVEsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQy9CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxlQUFlLElBQUksTUFBTSxRQUFRLENBQUMsZUFBZSxFQUFFLEtBQUssU0FBUyxDQUFBO1FBRWhHLElBQUssYUFBYSxFQUFHO1lBQ25CLGNBQWMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtTQUNqRDthQUFNO1lBQ0wsd0JBQXdCO1lBQ3hCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBQyxHQUFHLENBQUMsR0FBQyxhQUFhLENBQUE7WUFDL0QsTUFBTSxpQkFBaUIsR0FBRztnQkFDeEIsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUN4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QW9EO1lBQ25HLE1BQU0sVUFBVSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsa0JBQWtCLENBQUUsVUFBVSxDQUFFLENBQUE7WUFFMUUsSUFBSyxDQUFDLFVBQVUsRUFBRztnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDdkUsT0FBTTthQUNQO1lBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUE7WUFFbEQsT0FBTyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtTQUNsRDtRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDdEIsSUFBSyxnQkFBZ0IsRUFBRztZQUN0QixLQUFLLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1NBQ3JEO1FBRUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUE7UUFDM0QsSUFBSyxDQUFDLFFBQVEsRUFBRztZQUNmLE9BQU07U0FDUDtRQUVELDhCQUE4QjtRQUM5QixrREFBa0Q7UUFFbEQsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNlRG1GaWxlUmVhZGVyLCBEaXJlY3RvcnlNYW5hZ2VyLCBEbUZpbGVSZWFkZXIgfSBmcm9tIFwiLi9EaXJlY3RvcnlNYW5hZ2Vyc1wiXG5pbXBvcnQgeyBkaXJlY3RvcnlSZWFkVG9BcnJheSB9IGZyb20gXCIuL2RpcmVjdG9yeVJlYWRUb0FycmF5LmZ1bmN0aW9uXCJcbmltcG9ydCB7IHBhdGggfSBmcm9tIFwiLi9wYXRoXCJcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEbUZpbGVSZWFkZXIgZXh0ZW5kcyBCYXNlRG1GaWxlUmVhZGVyIGltcGxlbWVudHMgRG1GaWxlUmVhZGVyIHtcbiAgbmFtZTogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGU6IEZpbGUgfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5OiBEaXJlY3RvcnlNYW5hZ2VyXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm5hbWUgPSBmaWxlLm5hbWVcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGZpbGVTdHJpbmc6IHN0cmluZykge1xuICAgIGxldCB3cml0YWJsZVN0cmVhbTogYW55XG4gICAgY29uc3QgbGlrZUZpbGU6IGFueSA9IHRoaXMuZmlsZVxuICAgIGNvbnN0IGhhc1Blcm1pc3Npb24gPSBsaWtlRmlsZS5xdWVyeVBlcm1pc3Npb24gJiYgYXdhaXQgbGlrZUZpbGUucXVlcnlQZXJtaXNzaW9uKCkgPT09ICdncmFudGVkJ1xuXG4gICAgaWYgKCBoYXNQZXJtaXNzaW9uICkge1xuICAgICAgd3JpdGFibGVTdHJlYW0gPSBhd2FpdCBsaWtlRmlsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlcXVlc3Qgd2hlcmUgdG8gc2F2ZVxuICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csJy0nKSsnLWZpbGVQaWNrZXInXG4gICAgICBjb25zdCBzYXZlUGlja2VyT3B0aW9ucyA9IHtcbiAgICAgICAgc3VnZ2VzdGVkTmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAvKnR5cGVzOiBbe1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSlNPTicsXG4gICAgICAgICAgYWNjZXB0OiB7XG4gICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IFsnLmpzb24nXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XSwqL1xuICAgICAgfVxuXG4gICAgICAvLyBiZWxvdywgdGhvdWdodCB0byByZW1lbWJlciBsYXN0IG1hdGNoaW5nIGZpbGUgKGkgdGhpbmsgZGF0YSB0eXBpbmcgaXMganVzdCBtaXNzaW5nIGZvciBpdClcbiAgICAgIDsoc2F2ZVBpY2tlck9wdGlvbnMgYXMgYW55KS5pZCA9IGlkLnNsaWNlKDAsIDMyKVxuXG4gICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyKHNhdmVQaWNrZXJPcHRpb25zKVxuICAgICAgXG4gICAgICB3cml0YWJsZVN0cmVhbSA9IGF3YWl0IGhhbmRsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfVxuXG5cbiAgICAvLyB3cml0ZSBvdXIgZmlsZVxuICAgIGF3YWl0IHdyaXRhYmxlU3RyZWFtLndyaXRlKCBmaWxlU3RyaW5nIClcblxuICAgIC8vIGNsb3NlIHRoZSBmaWxlIGFuZCB3cml0ZSB0aGUgY29udGVudHMgdG8gZGlzay5cbiAgICBhd2FpdCB3cml0YWJsZVN0cmVhbS5jbG9zZSgpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldFJlYWRGaWxlKCk6IFByb21pc2U8RmlsZT4ge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGUgYXMgYW55XG4gICAgcmV0dXJuIGZpbGUuZ2V0RmlsZSA/IGF3YWl0IGZpbGUuZ2V0RmlsZSgpIDogUHJvbWlzZS5yZXNvbHZlKGZpbGUpXG4gIH1cbiAgXG4gIG92ZXJyaWRlIHJlYWRBc1RleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlcywgcmVqKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5nZXRSZWFkRmlsZSgpXG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXMocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVqKGVycilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nLFxuICAgIHB1YmxpYyBmaWxlczogRmlsZVN5c3RlbUZpbGVIYW5kbGVbXSwgLy8gTGlrZUZpbGVbXSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5SGFuZGxlcjogRmlsZVN5c3RlbURpcmVjdG9yeUhhbmRsZSxcbiAgKSB7fVxuXG4gIGFzeW5jIGxpc3QoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuXG4gIC8qXG4gIHByaXZhdGUgZ2V0U3lzdGVtRmlsZShcbiAgICBmaWxlOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVxuICApOiBQcm9taXNlPEZpbGVTeXN0ZW1GaWxlSGFuZGxlPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmaWxlKVxuICAgIFxuICAgIC8vIGxvYWQgYnJvd3NlciBmaWxlIFdJVEggY29ubmVjdGVkIHBlcm1pc3Npb25zXG4gICAgLy9yZXR1cm4gdGhpcy5kaXJlY3RvcnlIYW5kbGVyLmdldEZpbGVIYW5kbGUoZmlsZS5uYW1lKVxuICAgIFxuICAgIC8vIGxvYWQgYnJvd3NlciBmaWxlIGJ1dCB3aXRoIG5vIGNvbm5lY3RlZCBwZXJtaXNzaW9uc1xuICAgIC8vIHJldHVybiBmaWxlLmdldEZpbGUgPyBhd2FpdCBmaWxlLmdldEZpbGUoKSA6IGZpbGUgYXMgYW55XG4gIH0qL1xuICBcbiAgYXN5bmMgbGlzdEZpbGVzKCk6IFByb21pc2U8RG1GaWxlUmVhZGVyW10+IHtcbiAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoZmlsZSA9PiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlLCB0aGlzKSlcbiAgICAvKlxuICAgIGNvbnN0IGZpbGVQcm9taXNlczogUHJvbWlzZTxGaWxlU3lzdGVtRmlsZUhhbmRsZT5bXSA9IHRoaXMuZmlsZXNcbiAgICAgIC5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoYXN5bmMgZmlsZSA9PiB0aGlzLmdldFN5c3RlbUZpbGUoZmlsZSkpXG4gICAgXG4gICAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChmaWxlUHJvbWlzZXMpKVxuICAgICAgLm1hcChmaWxlID0+IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUpKVxuICAgICovXG4gIH1cblxuICBhc3luYyBnZXREaXJlY3RvcnkoXG4gICAgbmV3UGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9uc1xuICApIHtcbiAgICBjb25zdCBuZXdQYXRoQXJyYXkgPSBuZXdQYXRoLnNwbGl0KCcvJylcbiAgICBcbiAgICAvLyB0cmF2ZXJzZSB0aHJvdWdoIGVhY2ggZm9sZGVyXG4gICAgY29uc3QgZGlyOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlID0gYXdhaXQgbmV3UGF0aEFycmF5LnJlZHVjZShhc3luYyAobGFzdCxjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0OiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlID0gYXdhaXQgbGFzdFxuICAgICAgY29uc3QgbmV3SGFuZGxlID0gbmV4dC5nZXREaXJlY3RvcnlIYW5kbGUoY3VycmVudCwgb3B0aW9ucylcbiAgICAgIHJldHVybiBuZXdIYW5kbGVcbiAgICB9LCBQcm9taXNlLnJlc29sdmUodGhpcy5kaXJlY3RvcnlIYW5kbGVyKSlcbiAgICBcbiAgICBjb25zdCBmaWxlczogRmlsZVN5c3RlbUZpbGVIYW5kbGVbXSA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KGRpcilcbiAgICBjb25zdCBmdWxsTmV3UGF0aCA9IHBhdGguam9pbih0aGlzLnBhdGgsIG5ld1BhdGgpXG4gICAgY29uc3QgbmV3RGlyID0gbmV3IEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyKFxuICAgICAgZnVsbE5ld1BhdGgsXG4gICAgICBmaWxlcyxcbiAgICAgIGRpclxuICAgIClcbiAgICByZXR1cm4gbmV3RGlyXG4gIH1cblxuICBhc3luYyBmaWxlKGZpbGVOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RmlsZU9wdGlvbnMpIHtcbiAgICBjb25zdCBmaW5kRmlsZSA9IGF3YWl0IHRoaXMuZmluZEZpbGVCeVBhdGgoZmlsZU5hbWUpXG5cbiAgICBpZiAoIGZpbmRGaWxlICkge1xuICAgICAgcmV0dXJuIGZpbmRGaWxlXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZUhhbmRsZSA9IGF3YWl0IHRoaXMuZGlyZWN0b3J5SGFuZGxlci5nZXRGaWxlSGFuZGxlKGZpbGVOYW1lLCBvcHRpb25zKVxuICAgIHJldHVybiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlSGFuZGxlLCB0aGlzKVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGgoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGRpcmVjdG9yeUhhbmRsZXI6IGFueSA9IHRoaXMuZGlyZWN0b3J5SGFuZGxlcixcbiAgKTogUHJvbWlzZTxCcm93c2VyRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcGF0aFNwbGl0ID0gcGF0aC5zcGxpdCgnLycpXG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoU3BsaXRbIHBhdGhTcGxpdC5sZW5ndGgtMSBdXG4gICAgaWYgKCAhdGhpcy5maWxlcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBjaHJvbWUgd2UgZGlnIHRocm91Z2ggdGhlIGZpcnN0IHNlbGVjdGVkIGRpcmVjdG9yeSBhbmQgc2VhcmNoIHRoZSBzdWJzXG4gICAgaWYgKCBwYXRoU3BsaXQubGVuZ3RoID4gMSApIHtcbiAgICAgIGNvbnN0IGxhc3RQYXJlbnQgPSBwYXRoU3BsaXQuc2hpZnQoKSBhcyBzdHJpbmcgLy8gcmVtb3ZlIGluZGV4IDAgb2YgbGFzdFBhcmVudC9maXJzdFBhcmVudC9maWxlLnh5elxuICAgICAgY29uc3QgbmV3SGFuZGxlciA9IGF3YWl0IGRpcmVjdG9yeUhhbmRsZXIuZ2V0RGlyZWN0b3J5SGFuZGxlKCBsYXN0UGFyZW50IClcbiAgICAgIFxuICAgICAgaWYgKCAhbmV3SGFuZGxlciApIHtcbiAgICAgICAgY29uc29sZS5kZWJ1Zygnbm8gbWF0Y2hpbmcgdXBwZXIgZm9sZGVyJywgbGFzdFBhcmVudCwgZGlyZWN0b3J5SGFuZGxlcilcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld1BhdGggPSBwYXRoU3BsaXQuam9pbignLycpXG4gICAgICBjb25zdCBkaXJNYW4gPSBhd2FpdCB0aGlzLmdldERpcmVjdG9yeShsYXN0UGFyZW50KVxuICAgICAgXG4gICAgICByZXR1cm4gZGlyTWFuLmZpbmRGaWxlQnlQYXRoKG5ld1BhdGgsIG5ld0hhbmRsZXIpXG4gICAgfVxuICAgIFxuICAgIGxldCBmaWxlcyA9IHRoaXMuZmlsZXNcbiAgICBpZiAoIGRpcmVjdG9yeUhhbmRsZXIgKSB7XG4gICAgICBmaWxlcyA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KGRpcmVjdG9yeUhhbmRsZXIpXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGxpa2VGaWxlID0gZmlsZXMuZmluZChmaWxlID0+IGZpbGUubmFtZSA9PT0gZmlsZU5hbWUpXG4gICAgaWYgKCAhbGlrZUZpbGUgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgLy8gd2hlbiBmb3VuZCwgY29udmVydCB0byBGaWxlXG4gICAgLy8gY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuZ2V0U3lzdGVtRmlsZShsaWtlRmlsZSlcbiAgICBcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIobGlrZUZpbGUsIHRoaXMpXG4gIH1cbn1cbiJdfQ==