import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { __awaiter, __asyncValues } from 'tslib';

function stringToXml(string) {
    return new DOMParser().parseFromString(string.trim(), "text/xml");
}

class BaseDmFileReader {
    readXmlFirstElementContentByTagName(tagName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const elements = yield this.readXmlElementsByTagName(tagName);
            return (_a = elements.find(tag => tag.textContent)) === null || _a === void 0 ? void 0 : _a.textContent;
        });
    }
    readXmlElementsByTagName(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            const xml = yield this.readAsXml();
            return new Array(...xml.getElementsByTagName(tagName));
        });
    }
    readXmlFirstElementByTagName(tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            const xml = yield this.readAsXml();
            const elements = new Array(...xml.getElementsByTagName(tagName));
            return elements.length ? elements[0] : undefined;
        });
    }
    readAsXml() {
        return __awaiter(this, void 0, void 0, function* () {
            const string = yield this.readAsText();
            return stringToXml(string);
        });
    }
    readAsJson() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(yield this.readAsText());
        });
    }
    readAsText() {
        throw new Error('no override provided for BaseDmFileReader.readAsText');
    }
}
function getNameByPath(path) {
    const half = path.split(/\//).pop();
    return half.split(/\\/).pop();
}
function findDirectoryWithin(path, inDir, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathSplit = path.split('/').filter(x => x);
        if (pathSplit.length >= 1) {
            const firstParent = pathSplit.shift(); // remove index 0 of firstParent/firstParent/file.xyz
            try {
                const parent = yield inDir.getDirectory(firstParent);
                if (!parent) {
                    return; // undefined
                }
                return yield findDirectoryWithin(pathSplit.join('/'), parent, options);
            }
            catch (err) {
                const folderList = yield inDir.listFolders();
                if (folderList.includes(firstParent)) {
                    throw err; // rethrow because its not about a missing folder
                }
                return; // our folderList does not contain what we are looking for
            }
        }
        return inDir; // return last result
    });
}
function renameFileInDir(oldFileName, newFileName, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldFile = yield dir.file(oldFileName);
        const data = yield oldFile.readAsText();
        const newFile = yield dir.file(newFileName, { create: true });
        yield newFile.write(data);
        yield dir.removeEntry(oldFileName);
        return newFile;
    });
}

function directoryReadToArray(
// directory: FileSystemFileHandle[] //LikeFile[]
directory //LikeFile[]
) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const files = []; // {name: string, kind: string, getFile: () => File}[] = []
        try {
            for (var _b = __asyncValues(directory.values()), _c; _c = yield _b.next(), !_c.done;) {
                const entry = _c.value;
                files.push(entry);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return files;
    });
}

const path = {
    join: (...args) => {
        return args.filter(value => value.length).join('/');
    }
};

class BrowserDmFileReader extends BaseDmFileReader {
    constructor(file, directory) {
        super();
        this.file = file;
        this.directory = directory;
        this.name = file.name;
    }
    stats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRealFile();
        });
    }
    write(fileString) {
        return __awaiter(this, void 0, void 0, function* () {
            let writableStream;
            const likeFile = this.file;
            const hasPermission = likeFile.queryPermission && (yield likeFile.queryPermission()) === 'granted';
            if (hasPermission) {
                writableStream = yield likeFile.createWritable();
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
                const handle = yield window.showSaveFilePicker(savePickerOptions);
                writableStream = yield handle.createWritable();
            }
            // write our file
            yield writableStream.write(fileString);
            // close the file and write the contents to disk.
            yield writableStream.close();
        });
    }
    getRealFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const file = this.file;
            return file.getFile ? yield file.getFile() : Promise.resolve(file);
        });
    }
    readAsText() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                const reader = new FileReader();
                const file = yield this.getRealFile();
                reader.readAsText(file);
                reader.onload = () => res(reader.result);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
    readAsDataURL() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                var reader = new FileReader();
                const file = yield this.getRealFile();
                reader.readAsDataURL(file);
                reader.onload = () => res(reader.result);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
}
class BrowserDirectoryManager {
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
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield directoryReadToArray(this.directoryHandler);
            return files.map(file => file.name);
        });
    }
    listFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield directoryReadToArray(this.directoryHandler);
            return items.filter((file) => file.kind && file.kind === 'directory')
                .map(file => file.name);
        });
    }
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield directoryReadToArray(this.directoryHandler);
            return items.filter((file) => file.kind === 'file')
                .map((file) => file.name);
        });
    }
    getFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            const names = yield this.listFolders();
            return Promise.all(names.map((name) => __awaiter(this, void 0, void 0, function* () { return yield this.getDirectory(name); })));
        });
    }
    getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield directoryReadToArray(this.directoryHandler);
            return files.filter(file => file.kind === 'file')
                .map(file => new BrowserDmFileReader(file, this));
        });
    }
    createDirectory(newPath) {
        return this.getDirectory(newPath, { create: true });
    }
    getDirectory(newPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!newPath) {
                return this;
            }
            const newPathArray = newPath.split(/\\|\//);
            let fullNewPath = this.path;
            let dir;
            try {
                // traverse through each folder
                dir = yield newPathArray.reduce((last, current) => __awaiter(this, void 0, void 0, function* () {
                    const next = yield last;
                    const newHandle = next.getDirectoryHandle(current, options);
                    const name = (yield newHandle).name;
                    fullNewPath = path.join(fullNewPath, name);
                    return newHandle;
                }), Promise.resolve(this.directoryHandler));
            }
            catch (err) {
                throw new Error(err.message + `. ${newPath} not found in ${this.name} (${this.path})`);
            }
            const files = yield directoryReadToArray(dir);
            const newDir = new BrowserDirectoryManager(fullNewPath, files, dir);
            return newDir;
        });
    }
    removeEntry(name, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const split = name.split(/\\|\//);
            const lastName = split.pop(); // remove last item
            const dir = split.length >= 1 ? yield this.getDirectory(split.join('/')) : this;
            return dir.directoryHandler.removeEntry(lastName, options);
        });
    }
    renameFile(oldFileName, newFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return renameFileInDir(oldFileName, newFileName, this);
        });
    }
    file(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const findFile = yield this.findFileByPath(path);
            if (findFile) {
                return findFile;
            }
            const dir = yield this.getDirForFilePath(path);
            const fileName = path.split(/\\|\//).pop();
            const fileHandle = yield dir.directoryHandler.getFileHandle(fileName, options);
            return new BrowserDmFileReader(fileHandle, this);
        });
    }
    findFileByPath(path, directoryHandler = this.directoryHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathSplit = path.split(/\\|\//);
            const fileName = pathSplit.pop(); // pathSplit[ pathSplit.length-1 ]
            let dir = this;
            // chrome we dig through the first selected directory and search the subs
            if (pathSplit.length) {
                dir = yield this.getDirectory(pathSplit.join('/'));
                directoryHandler = dir.directoryHandler;
            }
            let files = this.files;
            files = yield directoryReadToArray(directoryHandler);
            const likeFile = files.find(file => file.name === fileName);
            if (!likeFile) {
                return;
            }
            // when found, convert to File
            // const file = await this.getSystemFile(likeFile)
            return new BrowserDmFileReader(likeFile, dir);
        });
    }
    getDirForFilePath(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathSplit = path.split(/\\|\//);
            pathSplit.pop(); // pathSplit[ pathSplit.length-1 ]
            return yield this.getDirectory(pathSplit.join('/'));
        });
    }
}

function convertSlashes(string) {
    return string.replace('\\', '/');
}

const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
class NeutralinoDmFileReader extends BaseDmFileReader {
    constructor(filePath, directory) {
        super();
        this.filePath = filePath;
        this.directory = directory;
        this.name = filePath.split(/\\|\//).pop();
    }
    stats() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield fs.getStats(this.filePath);
            stats.name = stats.name || this.name;
            return stats;
        });
    }
    readAsText() {
        return fs.readFile(this.filePath); // .toString()
    }
    readAsDataURL() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield fs.readBinaryFile(this.filePath);
            const view = new Uint8Array(data);
            var decoder = new TextDecoder('utf8');
            var b64encoded = btoa(decoder.decode(view));
            return b64encoded;
        });
    }
    write(fileString) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.writeFile(this.filePath, fileString);
        });
    }
}
class NeutralinoDirectoryManager {
    constructor(path) {
        this.path = path;
        this.name = getNameByPath(path);
    }
    findDirectory(path, options) {
        return findDirectoryWithin(path, this, options);
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const reads = yield Neutralino.filesystem.readDirectory(this.path);
            return reads.filter(read => !['.', '..'].includes(read.entry)).map(read => read.entry);
        });
    }
    listFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            const reads = yield Neutralino.filesystem.readDirectory(this.path);
            return reads.filter(read => !['.', '..'].includes(read.entry) && read.type === 'DIRECTORY')
                .map(read => read.entry);
        });
    }
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const reads = yield Neutralino.filesystem.readDirectory(this.path);
            return reads.filter(read => !['.', '..'].includes(read.entry) && read.type !== 'DIRECTORY')
                .map(read => read.entry);
        });
    }
    getFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all((yield this.listFolders()).map((name) => __awaiter(this, void 0, void 0, function* () { return yield this.getDirectory(name); })));
        });
    }
    getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const reads = yield Neutralino.filesystem.readDirectory(this.path);
            return reads.filter(read => !['.', '..'].includes(read.entry) && read.type !== 'DIRECTORY')
                .map(read => new NeutralinoDmFileReader(this.getFullPath(read.entry), this));
        });
    }
    createDirectory(newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathTo = path.join(this.path, newPath);
            yield Neutralino.filesystem.createDirectory(pathTo);
            return this.getDirectory(newPath);
        });
    }
    getDirectory(newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!newPath) {
                return this;
            }
            const pathTo = path.join(this.path, newPath);
            // ensure path exists
            yield Neutralino.filesystem.readDirectory(pathTo);
            return new NeutralinoDirectoryManager(pathTo);
        });
    }
    findFileByPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullFilePath = this.getFullPath(filePath);
            return new NeutralinoDmFileReader(fullFilePath, this);
        });
    }
    file(fileName, _options) {
        return this.findFileByPath(fileName);
    }
    getFullPath(itemPath) {
        let fullFilePath = path.join(this.path, itemPath);
        return convertSlashes(fullFilePath);
    }
    renameFile(oldFileName, newFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return renameFileInDir(oldFileName, newFileName, this);
        });
    }
    removeEntry(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const split = name.split(/\\|\//);
            const lastName = split.pop(); // remove last item
            const dir = split.length >= 1 ? yield this.getDirectory(split.join('/')) : this;
            const pathTo = path.join(dir.path, name);
            const fileNames = yield dir.listFiles();
            if (fileNames.includes(lastName)) {
                return Neutralino.filesystem.removeFile(pathTo);
            }
            yield Neutralino.filesystem.removeDirectory(pathTo);
            return;
        });
    }
}

class SafariDirectoryManager {
    constructor(path = '', files) {
        this.path = path;
        this.files = files;
        this.name = getNameByPath(path);
    }
    renameFile(oldFileName, newFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return renameFileInDir(oldFileName, newFileName, this);
        });
    }
    /** ⚠️ does not actually work */
    removeEntry(_name, _options) {
        throw 'removeEntry does not work in Safari';
    }
    findDirectory(path, options) {
        return findDirectoryWithin(path, this, options);
    }
    /** ⚠️ does not actually work */
    createDirectory(newPath) {
        return this.getDirectory(newPath);
    }
    getDirectory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            // safari gives you all items up front
            const nextItems = this.files.filter(file => {
                const relative = getWebkitPathRelativeTo(file, this.path);
                return relative.substring(0, path.length).toLowerCase() === path.toLowerCase();
            });
            return new SafariDirectoryManager(path, nextItems);
        });
    }
    getRelativeItems() {
        return this.files.filter(file => {
            const relative = getWebkitPathRelativeTo(file, this.path);
            return relative.split('/').length === 1; // lives within same directory
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRelativeItems().map(file => file.name);
        });
    }
    listFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRelativeItems()
                .filter(file => file.name.split('.').length === 1)
                .map(file => file.name);
        });
    }
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRelativeItems().map(file => file.name);
        });
    }
    getFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all((yield this.listFolders()).map((name) => __awaiter(this, void 0, void 0, function* () { return yield this.getDirectory(name); })));
        });
    }
    getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getRelativeItems().map(file => new BrowserDmFileReader(file, this));
        });
    }
    findFileByPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.files.length) {
                return;
            }
            // safari include the parent folder name so we need to prepend it to the file search
            const rootName = this.files[0].webkitRelativePath.split('/').shift();
            filePath = path.join(rootName, this.path, filePath);
            // safari just gives us every files upfront, find within that (huge) array
            const file = this.files.find(file => file.webkitRelativePath === filePath);
            return file ? new BrowserDmFileReader(file, this) : undefined;
        });
    }
    file(fileName, _options) {
        return __awaiter(this, void 0, void 0, function* () {
            const findFile = yield this.findFileByPath(fileName);
            if (findFile) {
                return findFile;
            }
            const superFile = new BrowserDmFileReader(new File([], fileName), this);
            return Promise.resolve(superFile);
        });
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

class RobustSelectDirectoryComponent {
    constructor() {
        this.error = new EventEmitter();
        this.directoryManagerChange = new EventEmitter();
    }
    getPickerId() {
        return this.pickerId || this.getId().replace(/[ -_]/g, '');
    }
    onPathReload(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof Neutralino === 'object') {
                const dm = new NeutralinoDirectoryManager(path);
                this.directoryManagerChange.emit(this.directoryManager = dm);
            }
        });
    }
    selectPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const isNeu = typeof Neutralino === 'object';
            if (isNeu) {
                let response = yield Neutralino.os.showFolderDialog();
                if (response) {
                    this.reloadPath = response;
                    const dm = new NeutralinoDirectoryManager(response);
                    this.directoryManagerChange.emit(this.directoryManager = dm);
                }
                return;
            }
            const canPickDir = window.showDirectoryPicker;
            // chrome
            if (canPickDir) {
                try {
                    const boxDir = yield window.showDirectoryPicker({
                        id: this.getPickerId(),
                        // id: this.getId(),
                        mode: 'readwrite'
                    });
                    const boxFiles = yield directoryReadToArray(boxDir);
                    const dm = new BrowserDirectoryManager('', boxFiles, boxDir);
                    this.directoryManagerChange.emit(this.directoryManager = dm);
                    return;
                }
                catch (err) {
                    if (err.message.includes('aborted')) {
                        return;
                    }
                    this.error.emit(err);
                }
            }
            // safari
            this.showDirectoryPicker();
        });
    }
    getId() {
        return 'robustFolderPicker-' + this.label;
    }
    showDirectoryPicker() {
        var _a;
        (_a = document.getElementById(this.getId())) === null || _a === void 0 ? void 0 : _a.click();
    }
    // safari read directory
    readInputDirectory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!input.files) {
                this.error.emit(new Error('no directory with files selected'));
                return; // no files selected
            }
            const files = Object.entries(input.files).filter(([key]) => key != 'length').map(([_key, value]) => value);
            const dm = new SafariDirectoryManager('', files);
            this.directoryManagerChange.emit(this.directoryManager = dm);
        });
    }
}
RobustSelectDirectoryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
RobustSelectDirectoryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<!-- search hints: reselect -->\n\n<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'robust-select-directory', template: "<!-- search hints: reselect -->\n\n<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n" }]
        }], propDecorators: { label: [{
                type: Input
            }], pickerId: [{
                type: Input
            }], reloadPath: [{
                type: Input
            }], error: [{
                type: Output
            }], directoryManager: [{
                type: Input
            }], directoryManagerChange: [{
                type: Output
            }] } });

const declarations$1 = [
    RobustSelectDirectoryComponent,
];

const declarations = [...declarations$1];
class AckComponentsModule {
    static forRoot() {
        return {
            ngModule: AckComponentsModule,
        };
    }
}
AckComponentsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AckComponentsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, declarations: [RobustSelectDirectoryComponent], imports: [CommonModule], exports: [RobustSelectDirectoryComponent] });
AckComponentsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations,
                    exports: declarations
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { AckComponentsModule, RobustSelectDirectoryComponent, declarations$1 as declarations, path };
//# sourceMappingURL=ack-angular-components.mjs.map
