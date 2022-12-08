import { convertSlashes } from "./convertSlashes";
import { BaseDmFileReader } from "./DirectoryManagers";
import { path } from "./path";
const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
export class NeutralinoDmFileReader extends BaseDmFileReader {
    constructor(filePath, directory) {
        super();
        this.filePath = filePath;
        this.directory = directory;
        this.name = filePath.split('/').pop();
    }
    readAsText() {
        return fs.readFile(this.filePath); // .toString()
    }
    async write(fileString) {
        return fs.writeFile(this.filePath, fileString);
    }
}
export class NeutralinoDirectoryManager {
    constructor(path) {
        this.path = path;
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
    async getFiles() {
        const reads = await Neutralino.filesystem.readDirectory(this.path);
        return reads.filter(read => !['.', '..'].includes(read.entry) && read.type !== 'DIRECTORY')
            .map(read => new NeutralinoDmFileReader(this.getFullPath(read.entry), this));
    }
    async getDirectory(newPath) {
        return new NeutralinoDirectoryManager(path.join(this.path, newPath));
    }
    async findFileByPath(filePath) {
        const fullFilePath = this.getFullPath(filePath);
        return new NeutralinoDmFileReader(fullFilePath, this);
    }
    file(fileName, _options) {
        return this.findFileByPath(fileName);
    }
    getFullPath(itemPath) {
        let fullFilePath = path.join(this.path, itemPath);
        return convertSlashes(fullFilePath);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL05ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQWtDLE1BQU0scUJBQXFCLENBQUE7QUFDdEYsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUc3QixNQUFNLEVBQUUsR0FBRyxPQUFPLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUV0RSxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0JBQWdCO0lBRzFELFlBQ1MsUUFBZ0IsRUFDaEIsU0FBcUM7UUFFNUMsS0FBSyxFQUFFLENBQUE7UUFIQSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2hCLGNBQVMsR0FBVCxTQUFTLENBQTRCO1FBRzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQVksQ0FBQTtJQUNqRCxDQUFDO0lBRVEsVUFBVTtRQUNqQixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUMsY0FBYztJQUNsRCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFrQjtRQUM1QixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sMEJBQTBCO0lBQ3JDLFlBQ1MsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7SUFDbEIsQ0FBQztJQUVKLEtBQUss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WUFBWSxDQUFDLENBQUE7SUFDckMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29udmVydFNsYXNoZXMgfSBmcm9tIFwiLi9jb252ZXJ0U2xhc2hlc1wiXG5pbXBvcnQgeyBCYXNlRG1GaWxlUmVhZGVyLCBEaXJlY3RvcnlNYW5hZ2VyLCBEbUZpbGVSZWFkZXIgfSBmcm9tIFwiLi9EaXJlY3RvcnlNYW5hZ2Vyc1wiXG5pbXBvcnQgeyBwYXRoIH0gZnJvbSBcIi4vcGF0aFwiXG5cbmRlY2xhcmUgY29uc3QgTmV1dHJhbGlubzogYW55XG5jb25zdCBmcyA9IHR5cGVvZiBOZXV0cmFsaW5vID09PSAnb2JqZWN0JyA/IE5ldXRyYWxpbm8uZmlsZXN5c3RlbSA6IHt9XG5cbmV4cG9ydCBjbGFzcyBOZXV0cmFsaW5vRG1GaWxlUmVhZGVyIGV4dGVuZHMgQmFzZURtRmlsZVJlYWRlciBpbXBsZW1lbnRzIERtRmlsZVJlYWRlciB7XG4gIG5hbWU6IHN0cmluZ1xuICBcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgcHVibGljIGRpcmVjdG9yeTogTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIsXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm5hbWUgPSBmaWxlUGF0aC5zcGxpdCgnLycpLnBvcCgpIGFzIHN0cmluZ1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVhZEFzVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBmcy5yZWFkRmlsZSh0aGlzLmZpbGVQYXRoKSAvLyAudG9TdHJpbmcoKVxuICB9XG5cbiAgYXN5bmMgd3JpdGUoZmlsZVN0cmluZzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZzLndyaXRlRmlsZSh0aGlzLmZpbGVQYXRoLCBmaWxlU3RyaW5nKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nLFxuICApIHt9XG5cbiAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcmVhZHM6IHtlbnRyeTogJ0ZJTEUnIHwgJ0RJUkVDVE9SWScsIHR5cGU6IHN0cmluZ31bXSA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZWFkRGlyZWN0b3J5KCB0aGlzLnBhdGggKVxuICAgIHJldHVybiByZWFkcy5maWx0ZXIocmVhZCA9PiAhWycuJywnLi4nXS5pbmNsdWRlcyhyZWFkLmVudHJ5KSkubWFwKHJlYWQgPT4gcmVhZC5lbnRyeSlcbiAgfVxuXG4gIGFzeW5jIGxpc3RGb2xkZXJzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCByZWFkczoge2VudHJ5OiBzdHJpbmcsIHR5cGU6ICdGSUxFJyB8ICdESVJFQ1RPUlknfVtdID0gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWREaXJlY3RvcnkoIHRoaXMucGF0aCApXG4gICAgcmV0dXJuIHJlYWRzLmZpbHRlcihyZWFkID0+ICFbJy4nLCcuLiddLmluY2x1ZGVzKHJlYWQuZW50cnkpICYmIHJlYWQudHlwZSA9PT0gJ0RJUkVDVE9SWScpXG4gICAgICAubWFwKHJlYWQgPT4gcmVhZC5lbnRyeSlcbiAgfVxuXG4gIGFzeW5jIGxpc3RGaWxlcygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcmVhZHM6IHtlbnRyeTogc3RyaW5nLCB0eXBlOiAnRklMRScgfCAnRElSRUNUT1JZJ31bXSA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZWFkRGlyZWN0b3J5KCB0aGlzLnBhdGggKVxuICAgIHJldHVybiByZWFkcy5maWx0ZXIocmVhZCA9PiAhWycuJywnLi4nXS5pbmNsdWRlcyhyZWFkLmVudHJ5KSAmJiByZWFkLnR5cGUgIT09ICdESVJFQ1RPUlknKVxuICAgICAgLm1hcChyZWFkID0+IHJlYWQuZW50cnkpXG4gIH1cblxuICBhc3luYyBnZXRGaWxlcygpOiBQcm9taXNlPERtRmlsZVJlYWRlcltdPiB7XG4gICAgY29uc3QgcmVhZHM6IHtlbnRyeTogc3RyaW5nLCB0eXBlOiAnRklMRScgfCAnRElSRUNUT1JZJ31bXSA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZWFkRGlyZWN0b3J5KCB0aGlzLnBhdGggKVxuICAgIHJldHVybiByZWFkcy5maWx0ZXIocmVhZCA9PiAhWycuJywnLi4nXS5pbmNsdWRlcyhyZWFkLmVudHJ5KSAmJiByZWFkLnR5cGUgIT09ICdESVJFQ1RPUlknKVxuICAgICAgLm1hcChyZWFkID0+IG5ldyBOZXV0cmFsaW5vRG1GaWxlUmVhZGVyKHRoaXMuZ2V0RnVsbFBhdGgocmVhZC5lbnRyeSksIHRoaXMpKVxuICB9XG5cbiAgYXN5bmMgZ2V0RGlyZWN0b3J5KG5ld1BhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIoIHBhdGguam9pbih0aGlzLnBhdGgsIG5ld1BhdGgpIClcbiAgfVxuXG4gIGFzeW5jIGZpbmRGaWxlQnlQYXRoIChcbiAgICBmaWxlUGF0aDogc3RyaW5nLFxuICApOiBQcm9taXNlPE5ldXRyYWxpbm9EbUZpbGVSZWFkZXI+IHtcbiAgICBjb25zdCBmdWxsRmlsZVBhdGggPSB0aGlzLmdldEZ1bGxQYXRoKGZpbGVQYXRoKVxuICAgIHJldHVybiBuZXcgTmV1dHJhbGlub0RtRmlsZVJlYWRlcihmdWxsRmlsZVBhdGgsIHRoaXMpXG4gIH1cblxuICBmaWxlKGZpbGVOYW1lOiBzdHJpbmcsIF9vcHRpb25zPzogRmlsZVN5c3RlbUdldEZpbGVPcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEZpbGVCeVBhdGgoZmlsZU5hbWUpXG4gIH1cblxuICBnZXRGdWxsUGF0aChpdGVtUGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IGZ1bGxGaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLnBhdGgsIGl0ZW1QYXRoKVxuICAgIHJldHVybiBjb252ZXJ0U2xhc2hlcyhmdWxsRmlsZVBhdGgpXG4gIH1cbn1cbiJdfQ==