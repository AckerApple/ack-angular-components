import { BrowserDmFileReader, findDirectoryWithin, getNameByPath } from "./BrowserDirectoryManagers";
import { path } from "./path";
export class SafariDirectoryManager {
    constructor(path = '', files) {
        this.path = path;
        this.files = files;
        this.name = getNameByPath(path);
    }
    findDirectory(path, options) {
        return findDirectoryWithin(path, this, options);
    }
    async getDirectory(path) {
        // safari gives you all items up front
        const nextItems = this.files.filter(file => {
            const relative = getWebkitPathRelativeTo(file, this.path);
            return relative.substring(0, path.length).toLowerCase() === path.toLowerCase();
        });
        return new SafariDirectoryManager(path, nextItems);
    }
    getRelativeItems() {
        return this.files.filter(file => {
            const relative = getWebkitPathRelativeTo(file, this.path);
            return relative.split('/').length === 1; // lives within same directory
        });
    }
    async list() {
        return this.getRelativeItems().map(file => file.name);
    }
    async listFolders() {
        return this.getRelativeItems()
            .filter(file => file.name.split('.').length === 1)
            .map(file => file.name);
    }
    async listFiles() {
        return this.getRelativeItems().map(file => file.name);
    }
    async getFolders() {
        return Promise.all((await this.listFolders()).map(async (name) => await this.getDirectory(name)));
    }
    async getFiles() {
        return this.getRelativeItems().map(file => new BrowserDmFileReader(file, this));
    }
    async findFileByPath(filePath) {
        if (!this.files.length) {
            return;
        }
        // safari include the parent folder name so we need to prepend it to the file search
        const rootName = this.files[0].webkitRelativePath.split('/').shift();
        filePath = path.join(rootName, this.path, filePath);
        // safari just gives us every files upfront, find within that (huge) array
        const file = this.files.find(file => file.webkitRelativePath === filePath);
        return file ? new BrowserDmFileReader(file, this) : undefined;
    }
    async file(fileName, _options) {
        const findFile = await this.findFileByPath(fileName);
        if (findFile) {
            return findFile;
        }
        const superFile = new BrowserDmFileReader(new File([], fileName), this);
        return Promise.resolve(superFile);
    }
}
function getWebkitPathRelativeTo(file, path) {
    const relativeSplit = file.webkitRelativePath.split('/');
    relativeSplit.shift(); // remove the first notation on safari results
    if (path !== '') {
        let splitCount = path.split('/').length;
        while (splitCount) {
            relativeSplit.shift(); // remove starting notations on safari results
            --splitCount;
        }
    }
    return relativeSplit.join('/');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FmYXJpRGlyZWN0b3J5TWFuYWdlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL1NhZmFyaURpcmVjdG9yeU1hbmFnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNwRyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBRTdCLE1BQU0sT0FBTyxzQkFBc0I7SUFHakMsWUFDUyxPQUFlLEVBQUUsRUFDakIsS0FBYTtRQURiLFNBQUksR0FBSixJQUFJLENBQWE7UUFDakIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUVwQixJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBRUQsYUFBYSxDQUNYLElBQVksRUFDWixPQUF1QztRQUV2QyxPQUFPLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBWTtRQUM3QixzQ0FBc0M7UUFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsTUFBTSxRQUFRLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUN6RCxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDaEYsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ3BELENB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RSxJQUFJLENBQUMsQ0FBQTtRQUN2RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDbkMsQ0FBQztDQUNGO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxJQUFVLEVBQUUsSUFBWTtJQUN2RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQSxDQUFDLDhDQUE4QztJQUNwRSxJQUFLLElBQUksS0FBSyxFQUFFLEVBQUc7UUFDakIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFDdkMsT0FBTyxVQUFVLEVBQUU7WUFDakIsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBLENBQUMsOENBQThDO1lBQ3BFLEVBQUUsVUFBVSxDQUFBO1NBQ2I7S0FDRjtJQUNELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0b3J5TWFuYWdlciwgRG1GaWxlUmVhZGVyIH0gZnJvbSBcIi4vRGlyZWN0b3J5TWFuYWdlcnNcIlxuaW1wb3J0IHsgQnJvd3NlckRtRmlsZVJlYWRlciwgZmluZERpcmVjdG9yeVdpdGhpbiwgZ2V0TmFtZUJ5UGF0aCB9IGZyb20gXCIuL0Jyb3dzZXJEaXJlY3RvcnlNYW5hZ2Vyc1wiXG5pbXBvcnQgeyBwYXRoIH0gZnJvbSBcIi4vcGF0aFwiXG5cbmV4cG9ydCBjbGFzcyBTYWZhcmlEaXJlY3RvcnlNYW5hZ2VyIGltcGxlbWVudHMgRGlyZWN0b3J5TWFuYWdlciB7XG4gIG5hbWU6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXRoOiBzdHJpbmcgPSAnJyxcbiAgICBwdWJsaWMgZmlsZXM6IEZpbGVbXSxcbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gZ2V0TmFtZUJ5UGF0aChwYXRoKVxuICB9XG5cbiAgZmluZERpcmVjdG9yeSAoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBGaWxlU3lzdGVtR2V0RGlyZWN0b3J5T3B0aW9ucyxcbiAgKTogUHJvbWlzZTxEaXJlY3RvcnlNYW5hZ2VyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIGZpbmREaXJlY3RvcnlXaXRoaW4ocGF0aCwgdGhpcywgb3B0aW9ucylcbiAgfVxuXG4gIGFzeW5jIGdldERpcmVjdG9yeShwYXRoOiBzdHJpbmcpIHtcbiAgICAvLyBzYWZhcmkgZ2l2ZXMgeW91IGFsbCBpdGVtcyB1cCBmcm9udFxuICAgIGNvbnN0IG5leHRJdGVtcyA9IHRoaXMuZmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgY29uc3QgcmVsYXRpdmUgPSBnZXRXZWJraXRQYXRoUmVsYXRpdmVUbyhmaWxlLCB0aGlzLnBhdGgpXG4gICAgICByZXR1cm4gcmVsYXRpdmUuc3Vic3RyaW5nKDAsIHBhdGgubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09PSBwYXRoLnRvTG93ZXJDYXNlKClcbiAgICB9KVxuICAgIHJldHVybiBuZXcgU2FmYXJpRGlyZWN0b3J5TWFuYWdlcihwYXRoLCBuZXh0SXRlbXMpXG4gIH1cblxuICBnZXRSZWxhdGl2ZUl0ZW1zKCkge1xuICAgIHJldHVybiB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlID0gZ2V0V2Via2l0UGF0aFJlbGF0aXZlVG8oZmlsZSwgdGhpcy5wYXRoKVxuICAgICAgcmV0dXJuIHJlbGF0aXZlLnNwbGl0KCcvJykubGVuZ3RoID09PSAxIC8vIGxpdmVzIHdpdGhpbiBzYW1lIGRpcmVjdG9yeVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBsaXN0KCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGl2ZUl0ZW1zKCkubWFwKGZpbGUgPT4gZmlsZS5uYW1lKVxuICB9XG5cbiAgYXN5bmMgbGlzdEZvbGRlcnMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aXZlSXRlbXMoKVxuICAgICAgLmZpbHRlcihmaWxlID0+IGZpbGUubmFtZS5zcGxpdCgnLicpLmxlbmd0aCA9PT0gMSlcbiAgICAgIC5tYXAoZmlsZSA9PiBmaWxlLm5hbWUpXG4gIH1cblxuICBhc3luYyBsaXN0RmlsZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aXZlSXRlbXMoKS5tYXAoZmlsZSA9PiBmaWxlLm5hbWUpXG4gIH1cbiAgXG4gIGFzeW5jIGdldEZvbGRlcnMoKTogUHJvbWlzZTxTYWZhcmlEaXJlY3RvcnlNYW5hZ2VyW10+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAoYXdhaXQgdGhpcy5saXN0Rm9sZGVycygpKS5tYXAoYXN5bmMgbmFtZSA9PiBhd2FpdCB0aGlzLmdldERpcmVjdG9yeShuYW1lKSlcbiAgICApXG4gIH1cblxuICBhc3luYyBnZXRGaWxlcygpOiBQcm9taXNlPERtRmlsZVJlYWRlcltdPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVJdGVtcygpLm1hcChmaWxlID0+IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUsIHRoaXMpKVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGggKGZpbGVQYXRoOiBzdHJpbmcgKTogUHJvbWlzZTxCcm93c2VyRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKCAhdGhpcy5maWxlcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBzYWZhcmkgaW5jbHVkZSB0aGUgcGFyZW50IGZvbGRlciBuYW1lIHNvIHdlIG5lZWQgdG8gcHJlcGVuZCBpdCB0byB0aGUgZmlsZSBzZWFyY2hcbiAgICBjb25zdCByb290TmFtZSA9IHRoaXMuZmlsZXNbMF0ud2Via2l0UmVsYXRpdmVQYXRoLnNwbGl0KCcvJykuc2hpZnQoKSBhcyBzdHJpbmdcbiAgICBmaWxlUGF0aCA9IHBhdGguam9pbihyb290TmFtZSwgdGhpcy5wYXRoLCBmaWxlUGF0aClcbiAgICBcbiAgICAvLyBzYWZhcmkganVzdCBnaXZlcyB1cyBldmVyeSBmaWxlcyB1cGZyb250LCBmaW5kIHdpdGhpbiB0aGF0IChodWdlKSBhcnJheVxuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGVzLmZpbmQoZmlsZSA9PiBmaWxlLndlYmtpdFJlbGF0aXZlUGF0aCA9PT0gZmlsZVBhdGgpIGFzIEZpbGUgfCB1bmRlZmluZWRcbiAgICByZXR1cm4gZmlsZSA/IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUsIHRoaXMpIDogdW5kZWZpbmVkXG4gIH1cblxuICBhc3luYyBmaWxlKGZpbGVOYW1lOiBzdHJpbmcsIF9vcHRpb25zPzogRmlsZVN5c3RlbUdldEZpbGVPcHRpb25zKSB7XG4gICAgY29uc3QgZmluZEZpbGUgPSBhd2FpdCB0aGlzLmZpbmRGaWxlQnlQYXRoKGZpbGVOYW1lKVxuXG4gICAgaWYgKCBmaW5kRmlsZSApIHtcbiAgICAgIHJldHVybiBmaW5kRmlsZVxuICAgIH1cblxuICAgIGNvbnN0IHN1cGVyRmlsZSA9IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKG5ldyBGaWxlKFtdLCBmaWxlTmFtZSksIHRoaXMpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzdXBlckZpbGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0V2Via2l0UGF0aFJlbGF0aXZlVG8oZmlsZTogRmlsZSwgcGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHJlbGF0aXZlU3BsaXQgPSBmaWxlLndlYmtpdFJlbGF0aXZlUGF0aC5zcGxpdCgnLycpXG4gIHJlbGF0aXZlU3BsaXQuc2hpZnQoKSAvLyByZW1vdmUgdGhlIGZpcnN0IG5vdGF0aW9uIG9uIHNhZmFyaSByZXN1bHRzXG4gIGlmICggcGF0aCAhPT0gJycgKSB7XG4gICAgbGV0IHNwbGl0Q291bnQgPSBwYXRoLnNwbGl0KCcvJykubGVuZ3RoXG4gICAgd2hpbGUgKHNwbGl0Q291bnQpIHtcbiAgICAgIHJlbGF0aXZlU3BsaXQuc2hpZnQoKSAvLyByZW1vdmUgc3RhcnRpbmcgbm90YXRpb25zIG9uIHNhZmFyaSByZXN1bHRzXG4gICAgICAtLXNwbGl0Q291bnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlbGF0aXZlU3BsaXQuam9pbignLycpXG59Il19