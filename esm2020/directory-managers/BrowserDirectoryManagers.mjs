import { BrowserDmFileReader } from "./BrowserDmFileReader";
import { copyFileInDir, findDirectoryWithin, getDirForFilePath, getNameByPath, renameFileInDir } from "./DirectoryManagers";
import { directoryReadToArray } from "./directoryReadToArray.function";
import { path } from "./path";
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
        // TODO: We may not need to read files in advanced (originally we did this for safari)
        const files = await directoryReadToArray(dir);
        const newDir = new BrowserDirectoryManager(fullNewPath, files, dir);
        return newDir;
    }
    async removeEntry(name, options) {
        const split = name.split(/\\|\//);
        const lastName = split.pop(); // remove last item
        const subDir = split.length >= 1;
        const dir = (subDir ? await this.getDirectory(split.join('/')) : this);
        return dir.directoryHandler.removeEntry(lastName, options);
    }
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
    }
    async copyFile(oldFileName, newFileName) {
        return copyFileInDir(oldFileName, newFileName, this);
    }
    async file(path, options) {
        const findFile = await this.findFileByPath(path);
        if (findFile) {
            return findFile;
        }
        const dirOptions = { create: options?.create };
        const dir = await getDirForFilePath(path, this, dirOptions);
        const fileName = path.split(/\\|\//).pop();
        const fileHandle = await dir.directoryHandler.getFileHandle(fileName, options);
        return new BrowserDmFileReader(fileHandle, dir);
    }
    async findFileByPath(path, directoryHandler = this.directoryHandler) {
        const pathSplit = path.split(/\\|\//);
        const fileName = pathSplit.pop(); // pathSplit[ pathSplit.length-1 ]
        let dir = this;
        // chrome we dig through the first selected directory and search the subs
        if (pathSplit.length) {
            const findDir = await this.findDirectory(pathSplit.join('/'));
            if (!findDir) {
                return;
            }
            dir = findDir;
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
        return new BrowserDmFileReader(likeFile, dir);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBb0IsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFBO0FBQzdJLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBRXRFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0IsTUFBTSxPQUFPLHVCQUF1QjtJQUdsQyxZQUNTLElBQVksRUFDWixLQUE2QixFQUFFLGNBQWM7SUFDN0MsZ0JBQTJDO1FBRjNDLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUF3QjtRQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1FBRWxELElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFFRCxhQUFhLENBQ1gsSUFBWSxFQUNaLE9BQXVDO1FBRXZDLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQWlELENBQUE7SUFDakcsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsTUFBTSxLQUFLLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUMvRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDckMsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXO1FBQ2YsTUFB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SSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUN0QixLQUFLLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ3BELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFBO1FBQzNELElBQUssQ0FBQyxRQUFRLEVBQUc7WUFDZixPQUFNO1NBQ1A7UUFFRCw4QkFBOEI7UUFDOUIsa0RBQWtEO1FBQ2xELE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDL0MsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnJvd3NlckRtRmlsZVJlYWRlciB9IGZyb20gXCIuL0Jyb3dzZXJEbUZpbGVSZWFkZXJcIlxuaW1wb3J0IHsgY29weUZpbGVJbkRpciwgRGlyZWN0b3J5TWFuYWdlciwgZmluZERpcmVjdG9yeVdpdGhpbiwgZ2V0RGlyRm9yRmlsZVBhdGgsIGdldE5hbWVCeVBhdGgsIHJlbmFtZUZpbGVJbkRpciB9IGZyb20gXCIuL0RpcmVjdG9yeU1hbmFnZXJzXCJcbmltcG9ydCB7IGRpcmVjdG9yeVJlYWRUb0FycmF5IH0gZnJvbSBcIi4vZGlyZWN0b3J5UmVhZFRvQXJyYXkuZnVuY3Rpb25cIlxuaW1wb3J0IHsgRG1GaWxlUmVhZGVyIH0gZnJvbSBcIi4vRG1GaWxlUmVhZGVyXCJcbmltcG9ydCB7IHBhdGggfSBmcm9tIFwiLi9wYXRoXCJcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyIGltcGxlbWVudHMgRGlyZWN0b3J5TWFuYWdlciB7XG4gIG5hbWU6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXRoOiBzdHJpbmcsXG4gICAgcHVibGljIGZpbGVzOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVtdLCAvLyBMaWtlRmlsZVtdLFxuICAgIHB1YmxpYyBkaXJlY3RvcnlIYW5kbGVyOiBGaWxlU3lzdGVtRGlyZWN0b3J5SGFuZGxlLFxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBnZXROYW1lQnlQYXRoKHBhdGgpXG4gIH1cblxuICBmaW5kRGlyZWN0b3J5IChcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zLFxuICApOiBQcm9taXNlPEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIGZpbmREaXJlY3RvcnlXaXRoaW4ocGF0aCwgdGhpcywgb3B0aW9ucykgYXMgUHJvbWlzZTxCcm93c2VyRGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD5cbiAgfVxuICBcbiAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBkaXJlY3RvcnlSZWFkVG9BcnJheSh0aGlzLmRpcmVjdG9yeUhhbmRsZXIpXG4gICAgcmV0dXJuIGZpbGVzLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgbGlzdEZvbGRlcnMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkodGhpcy5kaXJlY3RvcnlIYW5kbGVyKVxuICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGZpbGU6IGFueSkgPT4gZmlsZS5raW5kICYmIChmaWxlIGFzIGFueSkua2luZCA9PT0gJ2RpcmVjdG9yeScpXG4gICAgICAubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG4gIFxuICBhc3luYyBsaXN0RmlsZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkodGhpcy5kaXJlY3RvcnlIYW5kbGVyKVxuICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGZpbGU6IGFueSkgPT4gZmlsZS5raW5kID09PSAnZmlsZScpXG4gICAgICAubWFwKChmaWxlOiBhbnkpID0+IGZpbGUubmFtZSlcbiAgfVxuICBcbiAgYXN5bmMgZ2V0Rm9sZGVycygpOiBQcm9taXNlPERpcmVjdG9yeU1hbmFnZXJbXT4ge1xuICAgIGNvbnN0IG5hbWVzID0gYXdhaXQgdGhpcy5saXN0Rm9sZGVycygpXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgbmFtZXMubWFwKGFzeW5jIG5hbWUgPT4gYXdhaXQgdGhpcy5nZXREaXJlY3RvcnkobmFtZSkpXG4gICAgKSBhcyBQcm9taXNlPERpcmVjdG9yeU1hbmFnZXJbXT5cbiAgfVxuICBcbiAgYXN5bmMgZ2V0RmlsZXMoKTogUHJvbWlzZTxEbUZpbGVSZWFkZXJbXT4ge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkodGhpcy5kaXJlY3RvcnlIYW5kbGVyKVxuICAgIHJldHVybiBmaWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmtpbmQgPT09ICdmaWxlJylcbiAgICAgIC5tYXAoZmlsZSA9PiBuZXcgQnJvd3NlckRtRmlsZVJlYWRlcihmaWxlLCB0aGlzKSlcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxEaXJlY3RvcnlNYW5hZ2VyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0b3J5KG5ld1BhdGgsIHsgY3JlYXRlOiB0cnVlIH0pXG4gIH1cblxuICBhc3luYyBnZXREaXJlY3RvcnkoXG4gICAgbmV3UGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9uc1xuICApOiBQcm9taXNlPEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyPiB7XG4gICAgaWYgKCAhbmV3UGF0aCApIHtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGF0aEFycmF5ID0gbmV3UGF0aC5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGxldCBmdWxsTmV3UGF0aCA9IHRoaXMucGF0aFxuICAgIGxldCBkaXI6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGVcblxuICAgIHRyeSB7XG4gICAgICAvLyB0cmF2ZXJzZSB0aHJvdWdoIGVhY2ggZm9sZGVyXG4gICAgICBkaXIgID0gYXdhaXQgbmV3UGF0aEFycmF5LnJlZHVjZShhc3luYyAobGFzdCxjdXJyZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQ6IEZpbGVTeXN0ZW1EaXJlY3RvcnlIYW5kbGUgPSBhd2FpdCBsYXN0XG4gICAgICAgIGNvbnN0IG5ld0hhbmRsZSA9IG5leHQuZ2V0RGlyZWN0b3J5SGFuZGxlKGN1cnJlbnQsIG9wdGlvbnMpXG4gICAgICAgIGNvbnN0IG5hbWUgPSAoYXdhaXQgbmV3SGFuZGxlKS5uYW1lXG4gICAgICAgIGZ1bGxOZXdQYXRoID0gcGF0aC5qb2luKGZ1bGxOZXdQYXRoLCBuYW1lKVxuICAgICAgICByZXR1cm4gbmV3SGFuZGxlXG4gICAgICB9LCBQcm9taXNlLnJlc29sdmUodGhpcy5kaXJlY3RvcnlIYW5kbGVyKSlcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVyci5tZXNzYWdlICsgYC4gJHtuZXdQYXRofSBub3QgZm91bmQgaW4gJHt0aGlzLm5hbWV9ICgke3RoaXMucGF0aH0pYClcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXZSBtYXkgbm90IG5lZWQgdG8gcmVhZCBmaWxlcyBpbiBhZHZhbmNlZCAob3JpZ2luYWxseSB3ZSBkaWQgdGhpcyBmb3Igc2FmYXJpKVxuICAgIGNvbnN0IGZpbGVzOiBGaWxlU3lzdGVtRmlsZUhhbmRsZVtdID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoZGlyKVxuICAgIGNvbnN0IG5ld0RpciA9IG5ldyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlcihcbiAgICAgIGZ1bGxOZXdQYXRoLFxuICAgICAgZmlsZXMsXG4gICAgICBkaXJcbiAgICApXG4gICAgcmV0dXJuIG5ld0RpclxuICB9XG5cbiAgYXN5bmMgcmVtb3ZlRW50cnkoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IHJlY3Vyc2l2ZTogYm9vbGVhbiB9XG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNwbGl0ID0gbmFtZS5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGNvbnN0IGxhc3ROYW1lID0gc3BsaXQucG9wKCkgYXMgc3RyaW5nIC8vIHJlbW92ZSBsYXN0IGl0ZW1cbiAgICBjb25zdCBzdWJEaXIgPSBzcGxpdC5sZW5ndGggPj0gMVxuICAgIGNvbnN0IGRpciA9IChzdWJEaXIgPyBhd2FpdCB0aGlzLmdldERpcmVjdG9yeSggc3BsaXQuam9pbignLycpICkgOiB0aGlzKSBhcyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlclxuICAgIHJldHVybiBkaXIuZGlyZWN0b3J5SGFuZGxlci5yZW1vdmVFbnRyeShsYXN0TmFtZSwgb3B0aW9ucylcbiAgfVxuXG4gIGFzeW5jIHJlbmFtZUZpbGUoXG4gICAgb2xkRmlsZU5hbWU6IHN0cmluZyxcbiAgICBuZXdGaWxlTmFtZTogc3RyaW5nXG4gICk6IFByb21pc2U8RG1GaWxlUmVhZGVyPiB7XG4gICAgcmV0dXJuIHJlbmFtZUZpbGVJbkRpcihvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBjb3B5RmlsZShcbiAgICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICAgIG5ld0ZpbGVOYW1lOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxEbUZpbGVSZWFkZXI+IHtcbiAgICByZXR1cm4gY29weUZpbGVJbkRpcihvbGRGaWxlTmFtZSwgbmV3RmlsZU5hbWUsIHRoaXMpXG4gIH1cblxuICBhc3luYyBmaWxlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zPzogRmlsZVN5c3RlbUdldEZpbGVPcHRpb25zLFxuICApOiBQcm9taXNlPERtRmlsZVJlYWRlcj4ge1xuICAgIGNvbnN0IGZpbmRGaWxlID0gYXdhaXQgdGhpcy5maW5kRmlsZUJ5UGF0aChwYXRoKVxuICAgIGlmICggZmluZEZpbGUgKSB7XG4gICAgICByZXR1cm4gZmluZEZpbGVcbiAgICB9XG5cbiAgICBjb25zdCBkaXJPcHRpb25zID0geyBjcmVhdGU6IG9wdGlvbnM/LmNyZWF0ZSB9XG4gICAgY29uc3QgZGlyID0gYXdhaXQgZ2V0RGlyRm9yRmlsZVBhdGgocGF0aCwgdGhpcywgZGlyT3B0aW9ucykgYXMgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXJcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGguc3BsaXQoL1xcXFx8XFwvLykucG9wKCkgYXMgc3RyaW5nXG5cbiAgICBjb25zdCBmaWxlSGFuZGxlID0gYXdhaXQgZGlyLmRpcmVjdG9yeUhhbmRsZXIuZ2V0RmlsZUhhbmRsZShmaWxlTmFtZSwgb3B0aW9ucylcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIoZmlsZUhhbmRsZSwgZGlyKVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGgoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGRpcmVjdG9yeUhhbmRsZXI6IGFueSA9IHRoaXMuZGlyZWN0b3J5SGFuZGxlcixcbiAgKTogUHJvbWlzZTxCcm93c2VyRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcGF0aFNwbGl0ID0gcGF0aC5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aFNwbGl0LnBvcCgpIC8vIHBhdGhTcGxpdFsgcGF0aFNwbGl0Lmxlbmd0aC0xIF1cbiAgICBsZXQgZGlyOiBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciA9IHRoaXNcblxuICAgIC8vIGNocm9tZSB3ZSBkaWcgdGhyb3VnaCB0aGUgZmlyc3Qgc2VsZWN0ZWQgZGlyZWN0b3J5IGFuZCBzZWFyY2ggdGhlIHN1YnNcbiAgICBpZiAoIHBhdGhTcGxpdC5sZW5ndGggKSB7XG4gICAgICBjb25zdCBmaW5kRGlyID0gYXdhaXQgdGhpcy5maW5kRGlyZWN0b3J5KCBwYXRoU3BsaXQuam9pbignLycpIClcbiAgICAgIFxuICAgICAgaWYgKCAhZmluZERpciApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGRpciA9IGZpbmREaXJcbiAgICAgIGRpcmVjdG9yeUhhbmRsZXIgPSBkaXIuZGlyZWN0b3J5SGFuZGxlclxuICAgIH1cbiAgICBcbiAgICBsZXQgZmlsZXMgPSB0aGlzLmZpbGVzXG4gICAgZmlsZXMgPSBhd2FpdCBkaXJlY3RvcnlSZWFkVG9BcnJheShkaXJlY3RvcnlIYW5kbGVyKVxuICAgIGNvbnN0IGxpa2VGaWxlID0gZmlsZXMuZmluZChmaWxlID0+IGZpbGUubmFtZSA9PT0gZmlsZU5hbWUpXG4gICAgaWYgKCAhbGlrZUZpbGUgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgLy8gd2hlbiBmb3VuZCwgY29udmVydCB0byBGaWxlXG4gICAgLy8gY29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuZ2V0U3lzdGVtRmlsZShsaWtlRmlsZSlcbiAgICByZXR1cm4gbmV3IEJyb3dzZXJEbUZpbGVSZWFkZXIobGlrZUZpbGUsIGRpcilcbiAgfSAgXG59XG4iXX0=