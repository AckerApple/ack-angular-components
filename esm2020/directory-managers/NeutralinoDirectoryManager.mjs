import { convertSlashes } from "./convertSlashes";
import { findDirectoryWithin, getDirForFilePath, getNameByPath, renameFileInDir } from "./DirectoryManagers";
import { NeutralinoDmFileReader } from "./NeutralinoDmFileReader";
import { path } from "./path";
export class NeutralinoDirectoryManager {
    constructor(path) {
        this.path = path;
        this.name = getNameByPath(path);
    }
    findDirectory(path, options) {
        return findDirectoryWithin(path, this, options);
    }
    async list() {
        const reads = await Neutralino.filesystem.readDirectory(this.path);
        return reads.filter(read => !['.', '..'].includes(read.entry)).map(read => read.entry);
    }
    async listFolders() {
        const reads = await Neutralino.filesystem.readDirectory(this.path);
        return reads.filter(read => !['.', '..'].includes(read.entry) && read.type === 'DIRECTORY')
            .map(read => read.entry);
    }
    async listFiles() {
        const reads = await Neutralino.filesystem.readDirectory(this.path);
        return reads.filter(read => !['.', '..'].includes(read.entry) && read.type !== 'DIRECTORY')
            .map(read => read.entry);
    }
    async getFolders() {
        return Promise.all((await this.listFolders()).map(async (name) => await this.getDirectory(name)));
    }
    async getFiles() {
        const reads = await Neutralino.filesystem.readDirectory(this.path);
        return reads.filter(read => !['.', '..'].includes(read.entry) && read.type !== 'DIRECTORY')
            .map(read => new NeutralinoDmFileReader(this.getFullPath(read.entry), this));
    }
    async createDirectory(newPath) {
        try {
            const fullPath = path.join(this.path, convertSlashes(newPath));
            await Neutralino.filesystem.readDirectory(fullPath);
            // it exists, just read it
            return this.getDirectory(newPath);
        }
        catch (err) {
            if (err.code === 'NE_FS_NOPATHE') {
                const splitPath = convertSlashes(newPath).split('/');
                let pathTo = this.path;
                while (splitPath.length) {
                    const nowName = splitPath.shift();
                    pathTo = path.join(pathTo, nowName);
                    await Neutralino.filesystem.createDirectory(pathTo);
                }
                const fullPath = pathTo; // path.join(this.path, newPath)
                return new NeutralinoDirectoryManager(fullPath);
            }
            throw err;
        }
    }
    async getDirectory(newPath, options) {
        if (!newPath) {
            return this;
        }
        const pathTo = path.join(this.path, newPath);
        try {
            // ensure path exists
            await Neutralino.filesystem.readDirectory(pathTo);
            return new NeutralinoDirectoryManager(pathTo);
        }
        catch (err) {
            if (err.code === 'NE_FS_NOPATHE' && options?.create) {
                return this.createDirectory(newPath);
            }
            throw err; // rethrow
        }
    }
    async findFileByPath(path) {
        const pathSplit = path.split(/\\|\//);
        const fileName = pathSplit.pop().toLowerCase(); // pathSplit[ pathSplit.length-1 ]
        let dir = this;
        // chrome we dig through the first selected directory and search the subs
        if (pathSplit.length) {
            const findDir = await this.findDirectory(pathSplit.join('/'));
            if (!findDir) {
                return;
            }
            dir = findDir;
        }
        const files = await dir.listFiles();
        const matchName = files.find(listName => listName.toLowerCase() === fileName);
        if (!matchName) {
            return;
        }
        const fullPath = dir.getFullPath(matchName);
        return new NeutralinoDmFileReader(fullPath, dir);
    }
    async file(pathTo, options) {
        const existingFile = await this.findFileByPath(pathTo);
        if (existingFile) {
            return existingFile;
        }
        // TODO: This work should most likely only occur if the options.create flag is present otherwise throw not found error
        const dirOptions = { create: options?.create };
        const dir = await getDirForFilePath(pathTo, this, dirOptions);
        const fileName = pathTo.split(/\\|\//).pop();
        const fullPath = path.join(dir.path, fileName);
        return new NeutralinoDmFileReader(fullPath, dir);
    }
    getFullPath(itemPath) {
        let fullFilePath = path.join(this.path, itemPath);
        return convertSlashes(fullFilePath);
    }
    async copyFile(oldFileName, newFileName) {
        const copyFrom = path.join(this.path, oldFileName);
        const pasteTo = path.join(this.path, newFileName);
        await Neutralino.filesystem.copyFile(copyFrom, pasteTo);
        return await this.file(newFileName);
    }
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
    }
    async removeEntry(name, options) {
        const split = name.split(/\\|\//);
        const lastName = split.pop(); // remove last item
        const dir = split.length >= 1 ? await this.getDirectory(split.join('/')) : this;
        const pathTo = path.join(dir.path, lastName);
        const fileNames = await dir.listFiles();
        if (fileNames.includes(lastName)) {
            return Neutralino.filesystem.removeFile(pathTo);
        }
        try {
            await Neutralino.filesystem.removeDirectory(pathTo);
        }
        catch (err) {
            // if folder delete failed, it may have items within Neutralino does not have recursive delete
            if (err.code === 'NE_FS_RMDIRER' && options?.recursive) {
                return recurseRemoveDir(await dir.getDirectory(lastName));
            }
            throw err;
        }
        return;
    }
}
async function recurseRemoveDir(dir) {
    // remove all folders within
    const folders = await dir.getFolders();
    for (const subdir of folders) {
        await recurseRemoveDir(subdir);
    }
    // remove all files within
    const list = await dir.listFiles();
    for (const fileName of list) {
        await dir.removeEntry(fileName);
    }
    // try now to delete again
    return Neutralino.filesystem.removeDirectory(dir.path);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL05ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUNqRCxPQUFPLEVBQW9CLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUc5SCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBSTdCLE1BQU0sT0FBTywwQkFBMEI7SUFHckMsWUFDUyxJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBRUQsYUFBYSxDQUNYLElBQVksRUFDWixPQUF1QztRQUV2QyxPQUFPLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFvRCxDQUFBO0lBQ3BHLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFBO1FBQ3BFLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2RixDQUFDO0lBRUQsS0FB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MEI7SUFDMUIsT0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUE7QUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbnZlcnRTbGFzaGVzIH0gZnJvbSBcIi4vY29udmVydFNsYXNoZXNcIlxuaW1wb3J0IHsgRGlyZWN0b3J5TWFuYWdlciwgZmluZERpcmVjdG9yeVdpdGhpbiwgZ2V0RGlyRm9yRmlsZVBhdGgsIGdldE5hbWVCeVBhdGgsIHJlbmFtZUZpbGVJbkRpciB9IGZyb20gXCIuL0RpcmVjdG9yeU1hbmFnZXJzXCJcbmltcG9ydCB7IERtRmlsZVJlYWRlciB9IGZyb20gXCIuL0RtRmlsZVJlYWRlclwiXG5pbXBvcnQgeyBJTmV1dHJhbGlubyB9IGZyb20gXCIuL05ldXRyYWxpbm8udXRpbHNcIlxuaW1wb3J0IHsgTmV1dHJhbGlub0RtRmlsZVJlYWRlciB9IGZyb20gXCIuL05ldXRyYWxpbm9EbUZpbGVSZWFkZXJcIlxuaW1wb3J0IHsgcGF0aCB9IGZyb20gXCIuL3BhdGhcIlxuXG5kZWNsYXJlIGNvbnN0IE5ldXRyYWxpbm86IElOZXV0cmFsaW5vXG5cbmV4cG9ydCBjbGFzcyBOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBuYW1lOiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nLFxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBnZXROYW1lQnlQYXRoKHBhdGgpXG4gIH1cblxuICBmaW5kRGlyZWN0b3J5IChcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zLFxuICApOiBQcm9taXNlPE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIGZpbmREaXJlY3RvcnlXaXRoaW4ocGF0aCwgdGhpcywgb3B0aW9ucykgYXMgUHJvbWlzZTxOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlciB8IHVuZGVmaW5lZD5cbiAgfVxuXG4gIGFzeW5jIGxpc3QoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IHJlYWRzID0gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWREaXJlY3RvcnkoIHRoaXMucGF0aCApXG4gICAgcmV0dXJuIHJlYWRzLmZpbHRlcihyZWFkID0+ICFbJy4nLCcuLiddLmluY2x1ZGVzKHJlYWQuZW50cnkpKS5tYXAocmVhZCA9PiByZWFkLmVudHJ5KVxuICB9XG5cbiAgYXN5bmMgbGlzdEZvbGRlcnMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IHJlYWRzID0gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWREaXJlY3RvcnkoIHRoaXMucGF0aCApXG4gICAgcmV0dXJuIHJlYWRzLmZpbHRlcihyZWFkID0+ICFbJy4nLCcuLiddLmluY2x1ZGVzKHJlYWQuZW50cnkpICYmIHJlYWQudHlwZSA9PT0gJ0RJUkVDVE9SWScpXG4gICAgICAubWFwKHJlYWQgPT4gcmVhZC5lbnRyeSlcbiAgfVxuXG4gIGFzeW5jIGxpc3RGaWxlcygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcmVhZHMgPSBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVhZERpcmVjdG9yeSggdGhpcy5wYXRoIClcbiAgICByZXR1cm4gcmVhZHMuZmlsdGVyKHJlYWQgPT4gIVsnLicsJy4uJ10uaW5jbHVkZXMocmVhZC5lbnRyeSkgJiYgcmVhZC50eXBlICE9PSAnRElSRUNUT1JZJylcbiAgICAgIC5tYXAocmVhZCA9PiByZWFkLmVudHJ5KVxuICB9XG5cbiAgYXN5bmMgZ2V0Rm9sZGVycygpOiBQcm9taXNlPE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyW10+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAoYXdhaXQgdGhpcy5saXN0Rm9sZGVycygpKS5tYXAoYXN5bmMgbmFtZSA9PiBhd2FpdCB0aGlzLmdldERpcmVjdG9yeShuYW1lKSlcbiAgICApXG4gIH1cblxuICBhc3luYyBnZXRGaWxlcygpOiBQcm9taXNlPERtRmlsZVJlYWRlcltdPiB7XG4gICAgY29uc3QgcmVhZHMgPSBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVhZERpcmVjdG9yeSggdGhpcy5wYXRoIClcbiAgICByZXR1cm4gcmVhZHMuZmlsdGVyKHJlYWQgPT4gIVsnLicsJy4uJ10uaW5jbHVkZXMocmVhZC5lbnRyeSkgJiYgcmVhZC50eXBlICE9PSAnRElSRUNUT1JZJylcbiAgICAgIC5tYXAocmVhZCA9PiBuZXcgTmV1dHJhbGlub0RtRmlsZVJlYWRlcih0aGlzLmdldEZ1bGxQYXRoKHJlYWQuZW50cnkpLCB0aGlzKSlcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZURpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlcj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih0aGlzLnBhdGgsIGNvbnZlcnRTbGFzaGVzKG5ld1BhdGgpKVxuICAgICAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWREaXJlY3RvcnkoIGZ1bGxQYXRoIClcblxuICAgICAgLy8gaXQgZXhpc3RzLCBqdXN0IHJlYWQgaXRcbiAgICAgIHJldHVybiB0aGlzLmdldERpcmVjdG9yeShuZXdQYXRoKVxuICAgIH0gY2F0Y2goIGVycjogYW55ICl7XG4gICAgICBpZiAoIGVyci5jb2RlID09PSAnTkVfRlNfTk9QQVRIRScgKSB7XG4gICAgICAgIGNvbnN0IHNwbGl0UGF0aCA9IGNvbnZlcnRTbGFzaGVzKG5ld1BhdGgpLnNwbGl0KCcvJylcbiAgICAgICAgbGV0IHBhdGhUbyA9IHRoaXMucGF0aFxuICAgICAgICBcbiAgICAgICAgd2hpbGUoIHNwbGl0UGF0aC5sZW5ndGggKSB7XG4gICAgICAgICAgY29uc3Qgbm93TmFtZSA9IHNwbGl0UGF0aC5zaGlmdCgpIGFzIHN0cmluZ1xuICAgICAgICAgIHBhdGhUbyA9IHBhdGguam9pbihwYXRoVG8sIG5vd05hbWUpXG4gICAgICAgICAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmNyZWF0ZURpcmVjdG9yeShwYXRoVG8pXG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoVG8gLy8gcGF0aC5qb2luKHRoaXMucGF0aCwgbmV3UGF0aClcbiAgICAgICAgcmV0dXJuIG5ldyBOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlciggZnVsbFBhdGggKSAgICBcbiAgICAgIH1cbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldERpcmVjdG9yeShcbiAgICBuZXdQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEZpbGVTeXN0ZW1HZXREaXJlY3RvcnlPcHRpb25zXG4gICk6IFByb21pc2U8TmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXI+IHtcbiAgICBpZiAoICFuZXdQYXRoICkge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgXG4gICAgY29uc3QgcGF0aFRvID0gcGF0aC5qb2luKHRoaXMucGF0aCwgbmV3UGF0aClcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8gZW5zdXJlIHBhdGggZXhpc3RzXG4gICAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVhZERpcmVjdG9yeShwYXRoVG8pXG4gICAgICByZXR1cm4gbmV3IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyKCBwYXRoVG8gKVxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBpZiAoIGVyci5jb2RlID09PSAnTkVfRlNfTk9QQVRIRScgJiYgb3B0aW9ucz8uY3JlYXRlICkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVEaXJlY3RvcnkobmV3UGF0aClcbiAgICAgIH1cbiAgICAgIHRocm93IGVyciAvLyByZXRocm93XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGggKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxOZXV0cmFsaW5vRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcGF0aFNwbGl0ID0gcGF0aC5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGNvbnN0IGZpbGVOYW1lID0gKHBhdGhTcGxpdC5wb3AoKSBhcyBzdHJpbmcpLnRvTG93ZXJDYXNlKCkgLy8gcGF0aFNwbGl0WyBwYXRoU3BsaXQubGVuZ3RoLTEgXVxuICAgIGxldCBkaXI6IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyID0gdGhpc1xuXG4gICAgLy8gY2hyb21lIHdlIGRpZyB0aHJvdWdoIHRoZSBmaXJzdCBzZWxlY3RlZCBkaXJlY3RvcnkgYW5kIHNlYXJjaCB0aGUgc3Vic1xuICAgIGlmICggcGF0aFNwbGl0Lmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGZpbmREaXIgPSBhd2FpdCB0aGlzLmZpbmREaXJlY3RvcnkoIHBhdGhTcGxpdC5qb2luKCcvJykgKVxuICAgICAgXG4gICAgICBpZiAoICFmaW5kRGlyICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZGlyID0gZmluZERpclxuICAgIH1cbiAgICBcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGRpci5saXN0RmlsZXMoKVxuICAgIGNvbnN0IG1hdGNoTmFtZSA9IGZpbGVzLmZpbmQobGlzdE5hbWUgPT4gbGlzdE5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmlsZU5hbWUpXG4gICAgaWYgKCAhbWF0Y2hOYW1lICkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZnVsbFBhdGggPSBkaXIuZ2V0RnVsbFBhdGgobWF0Y2hOYW1lKVxuICAgIHJldHVybiBuZXcgTmV1dHJhbGlub0RtRmlsZVJlYWRlcihmdWxsUGF0aCwgZGlyKVxuICB9XG5cbiAgYXN5bmMgZmlsZShcbiAgICBwYXRoVG86IHN0cmluZyxcbiAgICBvcHRpb25zPzogRmlsZVN5c3RlbUdldEZpbGVPcHRpb25zXG4gICkge1xuICAgIGNvbnN0IGV4aXN0aW5nRmlsZSA9IGF3YWl0IHRoaXMuZmluZEZpbGVCeVBhdGgocGF0aFRvKVxuXG4gICAgaWYgKCBleGlzdGluZ0ZpbGUgKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdGaWxlXG4gICAgfVxuXG4gICAgLy8gVE9ETzogVGhpcyB3b3JrIHNob3VsZCBtb3N0IGxpa2VseSBvbmx5IG9jY3VyIGlmIHRoZSBvcHRpb25zLmNyZWF0ZSBmbGFnIGlzIHByZXNlbnQgb3RoZXJ3aXNlIHRocm93IG5vdCBmb3VuZCBlcnJvclxuICAgIGNvbnN0IGRpck9wdGlvbnMgPSB7IGNyZWF0ZTogb3B0aW9ucz8uY3JlYXRlIH1cbiAgICBjb25zdCBkaXIgPSBhd2FpdCBnZXREaXJGb3JGaWxlUGF0aChwYXRoVG8sIHRoaXMsIGRpck9wdGlvbnMpIGFzIE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyXG4gICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoVG8uc3BsaXQoL1xcXFx8XFwvLykucG9wKCkgYXMgc3RyaW5nXG4gICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4oZGlyLnBhdGgsIGZpbGVOYW1lKVxuXG4gICAgcmV0dXJuIG5ldyBOZXV0cmFsaW5vRG1GaWxlUmVhZGVyKGZ1bGxQYXRoLCBkaXIpXG4gIH1cblxuICBnZXRGdWxsUGF0aChpdGVtUGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IGZ1bGxGaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLnBhdGgsIGl0ZW1QYXRoKVxuICAgIHJldHVybiBjb252ZXJ0U2xhc2hlcyhmdWxsRmlsZVBhdGgpXG4gIH1cblxuICBhc3luYyBjb3B5RmlsZShcbiAgICBvbGRGaWxlTmFtZTogc3RyaW5nLFxuICAgIG5ld0ZpbGVOYW1lOiBzdHJpbmdcbiAgKSB7XG4gICAgY29uc3QgY29weUZyb20gPSBwYXRoLmpvaW4odGhpcy5wYXRoLCBvbGRGaWxlTmFtZSlcbiAgICBjb25zdCBwYXN0ZVRvID0gcGF0aC5qb2luKHRoaXMucGF0aCwgbmV3RmlsZU5hbWUpXG4gICAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmNvcHlGaWxlKGNvcHlGcm9tLCBwYXN0ZVRvKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbGUobmV3RmlsZU5hbWUpXG4gIH1cblxuICBhc3luYyByZW5hbWVGaWxlKFxuICAgIG9sZEZpbGVOYW1lOiBzdHJpbmcsXG4gICAgbmV3RmlsZU5hbWU6IHN0cmluZ1xuICApOiBQcm9taXNlPERtRmlsZVJlYWRlcj4ge1xuICAgIHJldHVybiByZW5hbWVGaWxlSW5EaXIob2xkRmlsZU5hbWUsIG5ld0ZpbGVOYW1lLCB0aGlzKVxuICB9XG5cbiAgYXN5bmMgcmVtb3ZlRW50cnkoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IHJlY3Vyc2l2ZTogYm9vbGVhbiB9XG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNwbGl0ID0gbmFtZS5zcGxpdCgvXFxcXHxcXC8vKVxuICAgIGNvbnN0IGxhc3ROYW1lID0gc3BsaXQucG9wKCkgYXMgc3RyaW5nIC8vIHJlbW92ZSBsYXN0IGl0ZW1cbiAgICBjb25zdCBkaXIgPSBzcGxpdC5sZW5ndGggPj0gMSA/IGF3YWl0IHRoaXMuZ2V0RGlyZWN0b3J5KCBzcGxpdC5qb2luKCcvJykgKSA6IHRoaXNcblxuICAgIGNvbnN0IHBhdGhUbyA9IHBhdGguam9pbihkaXIucGF0aCwgbGFzdE5hbWUpXG4gICAgXG4gICAgY29uc3QgZmlsZU5hbWVzID0gYXdhaXQgZGlyLmxpc3RGaWxlcygpXG4gICAgaWYgKCBmaWxlTmFtZXMuaW5jbHVkZXMobGFzdE5hbWUpICkge1xuICAgICAgcmV0dXJuIE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZW1vdmVGaWxlKHBhdGhUbylcbiAgICB9XG4gICAgICAgIFxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVtb3ZlRGlyZWN0b3J5KHBhdGhUbylcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgLy8gaWYgZm9sZGVyIGRlbGV0ZSBmYWlsZWQsIGl0IG1heSBoYXZlIGl0ZW1zIHdpdGhpbiBOZXV0cmFsaW5vIGRvZXMgbm90IGhhdmUgcmVjdXJzaXZlIGRlbGV0ZVxuICAgICAgaWYgKCBlcnIuY29kZSA9PT0gJ05FX0ZTX1JNRElSRVInICYmIG9wdGlvbnM/LnJlY3Vyc2l2ZSApIHtcbiAgICAgICAgcmV0dXJuIHJlY3Vyc2VSZW1vdmVEaXIoIGF3YWl0IGRpci5nZXREaXJlY3RvcnkobGFzdE5hbWUpIClcbiAgICAgIH1cbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICByZXR1cm5cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByZWN1cnNlUmVtb3ZlRGlyKFxuICBkaXI6IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyXG4pIHtcbiAgLy8gcmVtb3ZlIGFsbCBmb2xkZXJzIHdpdGhpblxuICBjb25zdCBmb2xkZXJzID0gYXdhaXQgZGlyLmdldEZvbGRlcnMoKVxuICBmb3IgKGNvbnN0IHN1YmRpciBvZiBmb2xkZXJzKSB7XG4gICAgYXdhaXQgcmVjdXJzZVJlbW92ZURpcihzdWJkaXIpXG4gIH1cblxuICAvLyByZW1vdmUgYWxsIGZpbGVzIHdpdGhpblxuICBjb25zdCBsaXN0ID0gYXdhaXQgZGlyLmxpc3RGaWxlcygpXG4gIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgbGlzdCkge1xuICAgIGF3YWl0IGRpci5yZW1vdmVFbnRyeShmaWxlTmFtZSlcbiAgfVxuXG4gIC8vIHRyeSBub3cgdG8gZGVsZXRlIGFnYWluXG4gIHJldHVybiBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVtb3ZlRGlyZWN0b3J5KCBkaXIucGF0aCApXG59Il19