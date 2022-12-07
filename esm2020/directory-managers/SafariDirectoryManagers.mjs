import { BrowserDmFileReader } from "./BrowserDirectoryManagers";
import { path } from "./path";
export class SafariDirectoryManager {
    constructor(path = '', files) {
        this.path = path;
        this.files = files;
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
    async listFiles() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FmYXJpRGlyZWN0b3J5TWFuYWdlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL1NhZmFyaURpcmVjdG9yeU1hbmFnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQ2hFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0IsTUFBTSxPQUFPLHNCQUFzQjtJQUNqQyxZQUNTLE9BQWUsRUFBRSxFQUNqQixLQUFhO1FBRGIsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUNqQixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQ25CLENBQUM7SUFFSixLQUFLLENBQUMsWUFBWSxDQUFDLElBQVk7UUFDN0Isc0NBQXNDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDekQsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ2hGLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixNQUFNLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBLENBQUMsOEJBQThCO1FBQ3hFLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkQsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ2IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ2pGLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFFLFFBQWdCO1FBQ3BDLElBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRztZQUN4QixPQUFNO1NBQ1A7UUFFRCxvRkFBb0Y7UUFDcEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFZLENBQUE7UUFDOUUsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFFbkQsMEVBQTBFO1FBQzFFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLFFBQVEsQ0FBcUIsQ0FBQTtRQUM5RixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFnQixFQUFFLFFBQW1DO1FBQzlELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUVwRCxJQUFLLFFBQVEsRUFBRztZQUNkLE9BQU8sUUFBUSxDQUFBO1NBQ2hCO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDdkUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ25DLENBQUM7Q0FDRjtBQUVELFNBQVMsdUJBQXVCLENBQUMsSUFBVSxFQUFFLElBQVk7SUFDdkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN4RCxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUEsQ0FBQyw4Q0FBOEM7SUFDcEUsSUFBSyxJQUFJLEtBQUssRUFBRSxFQUFHO1FBQ2pCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFBO1FBQ3ZDLE9BQU8sVUFBVSxFQUFFO1lBQ2pCLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQSxDQUFDLDhDQUE4QztZQUNwRSxFQUFFLFVBQVUsQ0FBQTtTQUNiO0tBQ0Y7SUFDRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDaEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdG9yeU1hbmFnZXIsIERtRmlsZVJlYWRlciB9IGZyb20gXCIuL0RpcmVjdG9yeU1hbmFnZXJzXCJcbmltcG9ydCB7IEJyb3dzZXJEbUZpbGVSZWFkZXIgfSBmcm9tIFwiLi9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnNcIlxuaW1wb3J0IHsgcGF0aCB9IGZyb20gXCIuL3BhdGhcIlxuXG5leHBvcnQgY2xhc3MgU2FmYXJpRGlyZWN0b3J5TWFuYWdlciBpbXBsZW1lbnRzIERpcmVjdG9yeU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nID0gJycsXG4gICAgcHVibGljIGZpbGVzOiBGaWxlW10sXG4gICkge31cblxuICBhc3luYyBnZXREaXJlY3RvcnkocGF0aDogc3RyaW5nKSB7XG4gICAgLy8gc2FmYXJpIGdpdmVzIHlvdSBhbGwgaXRlbXMgdXAgZnJvbnRcbiAgICBjb25zdCBuZXh0SXRlbXMgPSB0aGlzLmZpbGVzLmZpbHRlcihmaWxlID0+IHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlID0gZ2V0V2Via2l0UGF0aFJlbGF0aXZlVG8oZmlsZSwgdGhpcy5wYXRoKVxuICAgICAgcmV0dXJuIHJlbGF0aXZlLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcGF0aC50b0xvd2VyQ2FzZSgpXG4gICAgfSlcbiAgICByZXR1cm4gbmV3IFNhZmFyaURpcmVjdG9yeU1hbmFnZXIocGF0aCwgbmV4dEl0ZW1zKVxuICB9XG5cbiAgZ2V0UmVsYXRpdmVJdGVtcygpIHtcbiAgICByZXR1cm4gdGhpcy5maWxlcy5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICBjb25zdCByZWxhdGl2ZSA9IGdldFdlYmtpdFBhdGhSZWxhdGl2ZVRvKGZpbGUsIHRoaXMucGF0aClcbiAgICAgIHJldHVybiByZWxhdGl2ZS5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMSAvLyBsaXZlcyB3aXRoaW4gc2FtZSBkaXJlY3RvcnlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgbGlzdCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVJdGVtcygpLm1hcChmaWxlID0+IGZpbGUubmFtZSlcbiAgfVxuXG4gIGFzeW5jIGxpc3RGaWxlcygpOiBQcm9taXNlPERtRmlsZVJlYWRlcltdPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpdmVJdGVtcygpLm1hcChmaWxlID0+IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUsIHRoaXMpKVxuICB9XG5cbiAgYXN5bmMgZmluZEZpbGVCeVBhdGggKGZpbGVQYXRoOiBzdHJpbmcgKTogUHJvbWlzZTxCcm93c2VyRG1GaWxlUmVhZGVyIHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKCAhdGhpcy5maWxlcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBzYWZhcmkgaW5jbHVkZSB0aGUgcGFyZW50IGZvbGRlciBuYW1lIHNvIHdlIG5lZWQgdG8gcHJlcGVuZCBpdCB0byB0aGUgZmlsZSBzZWFyY2hcbiAgICBjb25zdCByb290TmFtZSA9IHRoaXMuZmlsZXNbMF0ud2Via2l0UmVsYXRpdmVQYXRoLnNwbGl0KCcvJykuc2hpZnQoKSBhcyBzdHJpbmdcbiAgICBmaWxlUGF0aCA9IHBhdGguam9pbihyb290TmFtZSwgdGhpcy5wYXRoLCBmaWxlUGF0aClcbiAgICBcbiAgICAvLyBzYWZhcmkganVzdCBnaXZlcyB1cyBldmVyeSBmaWxlcyB1cGZyb250LCBmaW5kIHdpdGhpbiB0aGF0IChodWdlKSBhcnJheVxuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGVzLmZpbmQoZmlsZSA9PiBmaWxlLndlYmtpdFJlbGF0aXZlUGF0aCA9PT0gZmlsZVBhdGgpIGFzIEZpbGUgfCB1bmRlZmluZWRcbiAgICByZXR1cm4gZmlsZSA/IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKGZpbGUsIHRoaXMpIDogdW5kZWZpbmVkXG4gIH1cblxuICBhc3luYyBmaWxlKGZpbGVOYW1lOiBzdHJpbmcsIF9vcHRpb25zPzogRmlsZVN5c3RlbUdldEZpbGVPcHRpb25zKSB7XG4gICAgY29uc3QgZmluZEZpbGUgPSBhd2FpdCB0aGlzLmZpbmRGaWxlQnlQYXRoKGZpbGVOYW1lKVxuXG4gICAgaWYgKCBmaW5kRmlsZSApIHtcbiAgICAgIHJldHVybiBmaW5kRmlsZVxuICAgIH1cblxuICAgIGNvbnN0IHN1cGVyRmlsZSA9IG5ldyBCcm93c2VyRG1GaWxlUmVhZGVyKG5ldyBGaWxlKFtdLCBmaWxlTmFtZSksIHRoaXMpXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzdXBlckZpbGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0V2Via2l0UGF0aFJlbGF0aXZlVG8oZmlsZTogRmlsZSwgcGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHJlbGF0aXZlU3BsaXQgPSBmaWxlLndlYmtpdFJlbGF0aXZlUGF0aC5zcGxpdCgnLycpXG4gIHJlbGF0aXZlU3BsaXQuc2hpZnQoKSAvLyByZW1vdmUgdGhlIGZpcnN0IG5vdGF0aW9uIG9uIHNhZmFyaSByZXN1bHRzXG4gIGlmICggcGF0aCAhPT0gJycgKSB7XG4gICAgbGV0IHNwbGl0Q291bnQgPSBwYXRoLnNwbGl0KCcvJykubGVuZ3RoXG4gICAgd2hpbGUgKHNwbGl0Q291bnQpIHtcbiAgICAgIHJlbGF0aXZlU3BsaXQuc2hpZnQoKSAvLyByZW1vdmUgc3RhcnRpbmcgbm90YXRpb25zIG9uIHNhZmFyaSByZXN1bHRzXG4gICAgICAtLXNwbGl0Q291bnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlbGF0aXZlU3BsaXQuam9pbignLycpXG59Il19