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
                const reader = new FileReader();
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
        const files = await directoryReadToArray(this.directoryHandler);
        return files.map(file => file.name);
    }
    async listFolders() {
        const items = await directoryReadToArray(this.directoryHandler);
        return items.filter((file) => file.kind && file.kind === 'directory')
            .map(file => file.name);
    }
    async listFiles() {
        const items = await directoryReadToArray(this.directoryHandler);
        return items.filter((file) => file.kind === 'file')
            .map((file) => file.name);
    }
    async getFolders() {
        const names = await this.listFolders();
        return Promise.all(names.map(async (name) => await this.getDirectory(name)));
    }
    async getFiles() {
        const files = await directoryReadToArray(this.directoryHandler);
        return files.filter(file => file.kind === 'file')
            .map(file => new BrowserDmFileReader(file, this));
    }
    createDirectory(newPath) {
        return this.getDirectory(newPath, { create: true });
    }
    async getDirectory(newPath, options) {
        if (!newPath) {
            return this;
        }
        const newPathArray = newPath.split(/\\|\//);
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
    async removeEntry(name, options) {
        const split = name.split(/\\|\//);
        const lastName = split.pop(); // remove last item
        const dir = split.length >= 1 ? await this.getDirectory(split.join('/')) : this;
        return dir.directoryHandler.removeEntry(lastName, options);
    }
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
    }
    async file(path, options) {
        const findFile = await this.findFileByPath(path);
        if (findFile) {
            return findFile;
        }
        const dir = await this.getDirForFilePath(path);
        const fileName = path.split(/\\|\//).pop();
        const fileHandle = await dir.directoryHandler.getFileHandle(fileName, options);
        return new BrowserDmFileReader(fileHandle, this);
    }
    async findFileByPath(path, directoryHandler = this.directoryHandler) {
        const pathSplit = path.split(/\\|\//);
        const fileName = pathSplit.pop(); // pathSplit[ pathSplit.length-1 ]
        // chrome we dig through the first selected directory and search the subs
        if (pathSplit.length) {
            const dir = await this.getDirectory(pathSplit.join('/'));
            directoryHandler = dir.directoryHandler;
        }
        let files = this.files;
        files = await directoryReadToArray(directoryHandler);
        const likeFile = files.find(file => file.name === fileName);
        if (!likeFile) {
            return;
        }
        // when found, convert to File
        // const file = await this.getSystemFile(likeFile)
        return new BrowserDmFileReader(likeFile, this);
    }
    async getDirForFilePath(path) {
        const pathSplit = path.split(/\\|\//);
        pathSplit.pop(); // pathSplit[ pathSplit.length-1 ]
        return await this.getDirectory(pathSplit.join('/'));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFrQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDM0ksT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDdEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUU3QixNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBR3ZELFlBQ1MsSUFBaUMsRUFDakMsU0FBMkI7UUFFbEMsS0FBSyxFQUFFLENBQUE7UUFIQSxTQUFJLEdBQUosSUFBSSxDQUE2QjtRQUNqQyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUdsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBa0I7UUFDNUIsSUFBSSxjQUFtQixDQUFBO1FBQ3ZCLE1BQU0sUUFBUSxHQUFRLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDL0IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGVBQWUsSUFBSSxNQUFNLFFBQVEsQ0FBQyxlQUFlLEVBQUUsS0FBSyxTQUFTLENBQUE7UUFFaEcsSUFBSyxhQUFhLEVBQUc7WUFDbkIsY0FBYyxHQUFHLE1BQU0sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO1NBQ2pEO2FBQU07WUFDTCx3QkFBd0I7WUFDeEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFDLEdBQUcsQ0FBQyxHQUFDLGFBQWEsQ0FBQTtZQUMvRCxNQUFNLGlCQUFpQixHQUFHO2dCQUN4QixhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ3hCOzs7OztxQkFLSzthQUNOLENBR0E7WUFBQyxpQkFBeUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFFaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUVqRSxjQUFjLEdBQUcsTUFBTSxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUE7U0FDL0M7UUFHRCxpQkFBaUI7UUFDakIsTUFBTSxjQUFjLENBQUMsS0FBSyxDQUFFLFVBQVUsQ0FBRSxDQUFBO1FBRXhDLGlEQUFpRDtRQUNqRCxNQUFNLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUM5QixDQUFDO0lBRU8sS0FBSyxDQUFDLFdBQVc7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQVcsQ0FBQTtRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3BFLENBQUM7SUFFUSxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNwQyxJQUFJO2dCQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO2dCQUNyQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUN2QixNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBZ0IsQ0FBQyxDQUFBO2FBQ25EO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ1Q7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3BDLElBQUk7Z0JBQ0YsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtnQkFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ3JDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQzFCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFnQixDQUFDLENBQUE7YUFDbkQ7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDVDtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLHVCQUF1QjtJQUdsQyxZQUNTLElBQVksRUFDWixLQUE2QixFQUFFLGNBQWM7SUFDN0MsZ0JBQTJDO1FBRjNDLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUF3QjtRQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1FBRWxELElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFFRCxhQUFhLENBQ1gsSUFBWSxFQUNaLE9BQXVDO1FBRXZDLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixNQUFNLEtBQUssR0FBRyxNQUFNLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQy9ELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVc7UUFDZixNQUFNLEtBQUssR0FBRyxNQUFNLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQy9ELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSyxJQUFZLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQzthQUNoRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ2IsTUFBTSxLQUFLLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUMvRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDO2FBQ3JELEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xDLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVTtRQUNkLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3RDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdkQsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUTtRQUNaLE1BQU0sS0FBSyxHQUFHLE1BQU0sb0JBQW9CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDL0QsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7YUFDOUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsZUFBZSxDQUFDLE9BQWU7UUFDN0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUNoQixPQUFlLEVBQ2YsT0FBdUM7UUFFdkMsSUFBSyxDQUFDLE9BQU8sRUFBRztZQUNkLE9BQU8sSUFBSSxDQUFBO1NBQ1o7UUFFRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzNDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDM0IsSUFBSSxHQUE4QixDQUFBO1FBRWxDLElBQUk7WUFDRiwrQkFBK0I7WUFDL0IsR0FBRyxHQUFJLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN0RCxNQUFNLElBQUksR0FBOEIsTUFBTSxJQUFJLENBQUE7Z0JBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7Z0JBQzNELE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUE7Z0JBQ25DLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDMUMsT0FBTyxTQUFTLENBQUE7WUFDbEIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQTtTQUMzQztRQUFDLE9BQU8sR0FBUSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUE7U0FDdkY7UUFFRCxNQUFNLEtBQUssR0FBMkIsTUFBTSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyRSxNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUF1QixDQUN4QyxXQUFXLEVBQ1gsS0FBSyxFQUNMLEdBQUcsQ0FDSixDQUFBO1FBQ0QsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FDZixJQUFZLEVBQ1osT0FBZ0M7UUFFaEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNqQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFZLENBQUEsQ0FBQyxtQkFBbUI7UUFDMUQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUNqRixPQUFPLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUNkLFdBQW1CLEVBQ25CLFdBQW1CO1FBRW5CLE9BQU8sZUFBZSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWSxFQUFFLE9BQWtDO1FBQ3pELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoRCxJQUFLLFFBQVEsRUFBRztZQUNkLE9BQU8sUUFBUSxDQUFBO1NBQ2hCO1FBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUE0QixDQUFBO1FBQ3pFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFZLENBQUE7UUFFcEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUM5RSxPQUFPLElBQUksbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2xELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUNsQixJQUFZLEVBQ1osbUJBQXdCLElBQUksQ0FBQyxnQkFBZ0I7UUFFN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNyQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQyxrQ0FBa0M7UUFFbkUseUVBQXlFO1FBQ3pFLElBQUssU0FBUyxDQUFDLE1BQU0sRUFBRztZQUN0QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFBO1lBQzFELGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQTtTQUN4QztRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDdEIsS0FBSyxHQUFHLE1BQU0sb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUNwRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQTtRQUMzRCxJQUFLLENBQUMsUUFBUSxFQUFHO1lBQ2YsT0FBTTtTQUNQO1FBRUQsOEJBQThCO1FBQzlCLGtEQUFrRDtRQUNsRCxPQUFPLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBWTtRQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JDLFNBQVMsQ0FBQyxHQUFHLEVBQVksQ0FBQSxDQUFDLGtDQUFrQztRQUU1RCxPQUFPLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUE7SUFDdkQsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZURtRmlsZVJlYWRlciwgRGlyZWN0b3J5TWFuYWdlciwgRG1GaWxlUmVhZGVyLCBmaW5kRGlyZWN0b3J5V2l0aGluLCBnZXROYW1lQnlQYXRoLCByZW5hbWVGaWxlSW5EaXIgfSBmcm9tIFwiLi9EaXJlY3RvcnlNYW5hZ2Vyc1wiXG5pbXBvcnQgeyBkaXJlY3RvcnlSZWFkVG9BcnJheSB9IGZyb20gXCIuL2RpcmVjdG9yeVJlYWRUb0FycmF5LmZ1bmN0aW9uXCJcbmltcG9ydCB7IHBhdGggfSBmcm9tIFwiLi9wYXRoXCJcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEbUZpbGVSZWFkZXIgZXh0ZW5kcyBCYXNlRG1GaWxlUmVhZGVyIGltcGxlbWVudHMgRG1GaWxlUmVhZGVyIHtcbiAgbmFtZTogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGU6IEZpbGUgfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5OiBEaXJlY3RvcnlNYW5hZ2VyXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm5hbWUgPSBmaWxlLm5hbWVcbiAgfVxuXG4gIGFzeW5jIHN0YXRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldFJlYWxGaWxlKClcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGZpbGVTdHJpbmc6IHN0cmluZykge1xuICAgIGxldCB3cml0YWJsZVN0cmVhbTogYW55XG4gICAgY29uc3QgbGlrZUZpbGU6IGFueSA9IHRoaXMuZmlsZVxuICAgIGNvbnN0IGhhc1Blcm1pc3Npb24gPSBsaWtlRmlsZS5xdWVyeVBlcm1pc3Npb24gJiYgYXdhaXQgbGlrZUZpbGUucXVlcnlQZXJtaXNzaW9uKCkgPT09ICdncmFudGVkJ1xuXG4gICAgaWYgKCBoYXNQZXJtaXNzaW9uICkge1xuICAgICAgd3JpdGFibGVTdHJlYW0gPSBhd2FpdCBsaWtlRmlsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlcXVlc3Qgd2hlcmUgdG8gc2F2ZVxuICAgICAgY29uc3QgaWQgPSB0aGlzLm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csJy0nKSsnLWZpbGVQaWNrZXInXG4gICAgICBjb25zdCBzYXZlUGlja2VyT3B0aW9ucyA9IHtcbiAgICAgICAgc3VnZ2VzdGVkTmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAvKnR5cGVzOiBbe1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSlNPTicsXG4gICAgICAgICAgYWNjZXB0OiB7XG4gICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IFsnLmpzb24nXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XSwqL1xuICAgICAgfVxuXG4gICAgICAvLyBiZWxvdywgdGhvdWdodCB0byByZW1lbWJlciBsYXN0IG1hdGNoaW5nIGZpbGUgKGkgdGhpbmsgZGF0YSB0eXBpbmcgaXMganVzdCBtaXNzaW5nIGZvciBpdClcbiAgICAgIDsoc2F2ZVBpY2tlck9wdGlvbnMgYXMgYW55KS5pZCA9IGlkLnNsaWNlKDAsIDMyKVxuXG4gICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyKHNhdmVQaWNrZXJPcHRpb25zKVxuICAgICAgXG4gICAgICB3cml0YWJsZVN0cmVhbSA9IGF3YWl0IGhhbmRsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfVxuXG5cbiAgICAvLyB3cml0ZSBvdXIgZmlsZVxuICAgIGF3YWl0IHdyaXRhYmxlU3RyZWFtLndyaXRlKCBmaWxlU3RyaW5nIClcblxuICAgIC8vIGNsb3NlIHRoZSBmaWxlIGFuZCB3cml0ZSB0aGUgY29udGVudHMgdG8gZGlzay5cbiAgICBhd2FpdCB3cml0YWJsZVN0cmVhbS5jbG9zZSgpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldFJlYWxGaWxlKCk6IFByb21pc2U8RmlsZT4ge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGUgYXMgYW55XG4gICAgcmV0dXJuIGZpbGUuZ2V0RmlsZSA/IGF3YWl0IGZpbGUuZ2V0RmlsZSgpIDogUHJvbWlzZS5yZXNvbHZlKGZpbGUpXG4gIH1cbiAgXG4gIG92ZXJyaWRlIHJlYWRBc1RleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlcywgcmVqKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmdldFJlYWxGaWxlKClcbiAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSlcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9ICgpID0+IHJlcyhyZWFkZXIucmVzdWx0IGFzIHN0cmluZylcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZWooZXJyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZWFkQXNEYXRhVVJMKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXMsIHJlaikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuZ2V0UmVhbEZpbGUoKVxuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKVxuICAgICAgICByZWFkZXIub25sb2FkID0gKCkgPT4gcmVzKHJlYWRlci5yZXN1bHQgYXMgc3RyaW5nKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJlaihlcnIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXIgaW1wbGVtZW50cyBEaXJlY3RvcnlNYW5hZ2VyIHtcbiAgbmFtZTogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHBhdGg6IHN0cmluZyxcbiAgICBwdWJsaWMgZmlsZXM6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlW10sIC8vIExpa2VGaWxlW10sXG4gICAgcHVibGljIGRpcmVjdG9yeUhhbmRsZXI6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUsXG4gICkge1xuICAgIHRoaXMubmFtZSA9IGdldE5hbWVCeVBhdGgocGF0aClcbiAgfVxuXG4gIGZpbmREaXJlY3RvcnkgKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zPzogRmlsZVN5c3RlbUdldERpcmVjdG9yeU9wdGlvbnMsXG4gICk6IFByb21pc2U8RGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiBmaW5kRGlyZWN0b3J5V2l0aGluKHBhdGgsIHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIGFzeW5jIGxpc3QoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkodGhpcy5kaXJlY3RvcnlIYW5kbGVyKVxuICAgIHJldHVybiBmaWxlcy5tYXAoZmlsZSA9PiBmaWxlLm5hbWUpXG4gIH1cbiAgXG4gIGFzeW5jIGxpc3RGb2xkZXJzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KHRoaXMuZGlyZWN0b3J5SGFuZGxlcilcbiAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChmaWxlOiBhbnkpID0+IGZpbGUua2luZCAmJiAoZmlsZSBhcyBhbnkpLmtpbmQgPT09ICdkaXJlY3RvcnknKVxuICAgICAgLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgbGlzdEZpbGVzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KHRoaXMuZGlyZWN0b3J5SGFuZGxlcilcbiAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChmaWxlOiBhbnkpID0+IGZpbGUua2luZCA9PT0gJ2ZpbGUnKVxuICAgICAgLm1hcCgoZmlsZTogYW55KSA9PiBmaWxlLm5hbWUpXG4gIH1cbiAgXG4gIGFzeW5jIGdldEZvbGRlcnMoKTogUHJvbWlzZTxCcm93c2VyRGlyZWN0b3J5TWFuYWdlcltdPiB7XG4gICAgY29uc3QgbmFtZXMgPSBhd2FpdCB0aGlzLmxpc3RGb2xkZXJzKClcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBuYW1lcy5tYXAoYXN5bmMgbmFtZSA9PiBhd2FpdCB0aGlzLmdldERpcmVjdG9yeShuYW1lKSlcbiAgICApXG4gIH1cbiAgXG4gIGFzeW5jIGdldEZpbGVzKCk6IFByb21pc2U8RG1GaWxlUmVhZGVyW10+IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KHRoaXMuZGlyZWN0b3J5SGFuZGxlcilcbiAgICByZXR1cm4gZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS5raW5kID09PSAnZmlsZScpXG4gICAgICAubWFwKGZpbGUgPT4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIoZmlsZSwgdGhpcykpXG4gIH1cblxuICBjcmVhdGVEaXJlY3RvcnkobmV3UGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0b3J5KG5ld1BhdGgsIHsgY3JlYXRlOiB0cnVlIH0pXG4gIH1cblxuICBhc3luYyBnZXREaXJlY3RvcnkoXG4gICAgbmV3UGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9uc1xuICApOiBQcm9taXNlPEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyPiB7XG4gICAgaWYgKCAhbmV3UGF0aCApIHtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGF0aEFycmF5ID0gbmV3UGF0aC5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGxldCBmdWxsTmV3UGF0aCA9IHRoaXMucGF0aFxuICAgIGxldCBkaXI6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGVcblxuICAgIHRyeSB7XG4gICAgICAvLyB0cmF2ZXJzZSB0aHJvdWdoIGVhY2ggZm9sZGVyXG4gICAgICBkaXIgID0gYXdhaXQgbmV3UGF0aEFycmF5LnJlZHVjZShhc3luYyAobGFzdCxjdXJyZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQ6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBsYXN0XG4gICAgICAgIGNvbnN0IG5ld0hhbmRsZSA9IG5leHQuZ2V0RGlyZWN0b3J5SGFuZGxlKGN1cnJlbnQsIG9wdGlvbnMpXG4gICAgICAgIGNvbnN0IG5hbWUgPSAoYXdhaXQgbmV3SGFuZGxlKS5uYW1lXG4gICAgICAgIGZ1bGxOZXdQYXRoID0gcGF0aC5qb2luKGZ1bGxOZXdQYXRoLCBuYW1lKVxuICAgICAgICByZXR1cm4gbmV3SGFuZGxlXG4gICAgICB9LCBQcm9taXNlLnJlc29sdmUodGhpcy5kaXJlY3RvcnlIYW5kbGVyKSlcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVyci5tZXNzYWdlICsgYC4gJHtuZXdQYXRofSBub3QgZm91bmQgaW4gJHt0aGlzLm5hbWV9ICgke3RoaXMucGF0aH0pYClcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlczogRmlsZVN5c3RlbUZpbGVIYW5kbGVbXSA9IGF3YWl0IGRpcmVjdG9yeVJlYWRUb0FycmF5KGRpcilcbiAgICBjb25zdCBuZXdEaXIgPSBuZXcgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXIoXG4gICAgICBmdWxsTmV3UGF0aCxcbiAgICAgIGZpbGVzLFxuICAgICAgZGlyXG4gICAgKVxuICAgIHJldHVybiBuZXdEaXJcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUVudHJ5KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zPzogeyByZWN1cnNpdmU6IGJvb2xlYW4gfVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzcGxpdCA9IG5hbWUuc3BsaXQoL1xcXFx8XFwvLylcbiAgICBjb25zdCBsYXN0TmFtZSA9IHNwbGl0LnBvcCgpIGFzIHN0cmluZyAvLyByZW1vdmUgbGFzdCBpdGVtXG4gICAgY29uc3QgZGlyID0gc3BsaXQubGVuZ3RoID49IDEgPyBhd2FpdCB0aGlzLmdldERpcmVjdG9yeSggc3BsaXQuam9pbignLycpICkgOiB0aGlzXG4gICAgcmV0dXJuIGRpci5kaXJlY3RvcnlIYW5kbGVyLnJlbW92ZUVudHJ5KGxhc3ROYW1lLCBvcHRpb25zKVxuICB9XG5cbiAgYXN5bmMgcmVuYW1lRmlsZShcbiAgICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICAgIG5ld0ZpbGVOYW1lOiBzdHJpbmdcbiAgKSB7XG4gICAgcmV0dXJuIHJlbmFtZUZpbGVJbkRpcihvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaWxlKHBhdGg6IHN0cmluZywgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXRGaWxlT3B0aW9ucykge1xuICAgIGNvbnN0IGZpbmRGaWxlID0gYXdhaXQgdGhpcy5maW5kRmlsZUJ5UGF0aChwYXRoKVxuICAgIGlmICggZmluZEZpbGUgKSB7XG4gICAgICByZXR1cm4gZmluZEZpbGVcbiAgICB9XG5cbiAgICBjb25zdCBkaXIgPSBhd2FpdCB0aGlzLmdldERpckZvckZpbGVQYXRoKHBhdGgpIGFzIEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyXG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLnNwbGl0KC9cXFxcfFxcLy8pLnBvcCgpIGFzIHN0cmluZ1xuXG4gICAgY29uc3QgZmlsZUhhbmRsZSA9IGF3YWl0IGRpci5kaXJlY3RvcnlIYW5kbGVyLmdldEZpbGVIYW5kbGUoZmlsZU5hbWUsIG9wdGlvbnMpXG4gICAgcmV0dXJuIG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGVIYW5kbGUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaW5kRmlsZUJ5UGF0aChcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgZGlyZWN0b3J5SGFuZGxlcjogYW55ID0gdGhpcy5kaXJlY3RvcnlIYW5kbGVyLFxuICApOiBQcm9taXNlPEJyb3dzZXJEbUZpbGVSZWFkZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KC9cXFxcfFxcLy8pXG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoU3BsaXQucG9wKCkgLy8gcGF0aFNwbGl0WyBwYXRoU3BsaXQubGVuZ3RoLTEgXVxuXG4gICAgLy8gY2hyb21lIHdlIGRpZyB0aHJvdWdoIHRoZSBmaXJzdCBzZWxlY3RlZCBkaXJlY3RvcnkgYW5kIHNlYXJjaCB0aGUgc3Vic1xuICAgIGlmICggcGF0aFNwbGl0Lmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGRpciA9IGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KCBwYXRoU3BsaXQuam9pbignLycpIClcbiAgICAgIGRpcmVjdG9yeUhhbmRsZXIgPSBkaXIuZGlyZWN0b3J5SGFuZGxlclxuICAgIH1cbiAgICBcbiAgICBsZXQgZmlsZXMgPSB0aGlzLmZpbGVzXG4gICAgZmlsZXMgPSBhd2FpdCBkaXJlY3RvcnlSZWFkVG9BcnJheShkaXJlY3RvcnlIYW5kbGVyKVxuICAgIGNvbnN0IGxpa2VGaWxlID0gZmlsZXMuZmluZChmaWxlID0+IGZpbGUubmFtZSA9PT0gZmlsZU5hbWUpXG4gICAgaWYgKCAhbGlrZUZpbGUgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgLy8gd2hlbiBmb3VuZCwgY29udmVydCB0byBGaWxlXG4gICAgLy8gY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuZ2V0U3lzdGVtRmlsZShsaWtlRmlsZSlcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIobGlrZUZpbGUsIHRoaXMpXG4gIH1cbiAgXG4gIGFzeW5jIGdldERpckZvckZpbGVQYXRoKHBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IHBhdGhTcGxpdCA9IHBhdGguc3BsaXQoL1xcXFx8XFwvLylcbiAgICBwYXRoU3BsaXQucG9wKCkgYXMgc3RyaW5nIC8vIHBhdGhTcGxpdFsgcGF0aFNwbGl0Lmxlbmd0aC0xIF1cbiAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KCBwYXRoU3BsaXQuam9pbignLycpIClcbiAgfVxufVxuXG4iXX0=