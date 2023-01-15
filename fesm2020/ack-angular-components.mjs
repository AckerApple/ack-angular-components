import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

function stringToXml(string) {
    return new DOMParser().parseFromString(string.trim(), "text/xml");
}

class BaseDmFileReader {
    async readXmlFirstElementContentByTagName(tagName) {
        const elements = await this.readXmlElementsByTagName(tagName);
        return elements.find(tag => tag.textContent)?.textContent;
    }
    async readXmlElementsByTagName(tagName) {
        const xml = await this.readAsXml();
        return new Array(...xml.getElementsByTagName(tagName));
    }
    async readXmlFirstElementByTagName(tagName) {
        const xml = await this.readAsXml();
        const elements = new Array(...xml.getElementsByTagName(tagName));
        return elements.length ? elements[0] : undefined;
    }
    async readAsXml() {
        const string = await this.readAsText();
        return stringToXml(string);
    }
    async readAsJson() {
        return JSON.parse(await this.readAsText());
    }
    readAsText() {
        throw new Error('no override provided for BaseDmFileReader.readAsText');
    }
}
function getNameByPath(path) {
    const half = path.split(/\//).pop();
    return half.split(/\\/).pop();
}
async function findDirectoryWithin(path, inDir, options) {
    const pathSplit = path.split('/').filter(x => x);
    if (pathSplit.length >= 1) {
        const firstParent = pathSplit.shift(); // remove index 0 of firstParent/firstParent/file.xyz
        try {
            const parent = await inDir.getDirectory(firstParent);
            if (!parent) {
                return; // undefined
            }
            return await findDirectoryWithin(pathSplit.join('/'), parent, options);
        }
        catch (err) {
            const folderList = await inDir.listFolders();
            if (folderList.includes(firstParent)) {
                throw err; // rethrow because its not about a missing folder
            }
            return; // our folderList does not contain what we are looking for
        }
    }
    return inDir; // return last result
}
async function renameFileInDir(oldFileName, newFileName, dir) {
    const oldFile = await dir.file(oldFileName);
    const data = await oldFile.readAsText();
    const newFile = await dir.file(newFileName, { create: true });
    await newFile.write(data);
    await dir.removeEntry(oldFileName);
    return newFile;
}

async function directoryReadToArray(
// directory: FileSystemFileHandle[] //LikeFile[]
directory //LikeFile[]
) {
    const files = []; // {name: string, kind: string, getFile: () => File}[] = []
    for await (const entry of directory.values()) {
        files.push(entry);
    }
    return files;
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
                var reader = new FileReader();
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
    async stats() {
        const stats = await fs.getStats(this.filePath);
        stats.name = stats.name || this.name;
        return stats;
    }
    readAsText() {
        return fs.readFile(this.filePath); // .toString()
    }
    async readAsDataURL() {
        let data = await fs.readBinaryFile(this.filePath);
        const view = new Uint8Array(data);
        var decoder = new TextDecoder('utf8');
        var b64encoded = btoa(decoder.decode(view));
        return b64encoded;
    }
    async write(fileString) {
        return fs.writeFile(this.filePath, fileString);
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
        const pathTo = path.join(this.path, newPath);
        await Neutralino.filesystem.createDirectory(pathTo);
        return this.getDirectory(newPath);
    }
    async getDirectory(newPath) {
        if (!newPath) {
            return this;
        }
        const pathTo = path.join(this.path, newPath);
        // ensure path exists
        await Neutralino.filesystem.readDirectory(pathTo);
        return new NeutralinoDirectoryManager(pathTo);
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
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
    }
    async removeEntry(name) {
        const split = name.split(/\\|\//);
        const lastName = split.pop(); // remove last item
        const dir = split.length >= 1 ? await this.getDirectory(split.join('/')) : this;
        const pathTo = path.join(dir.path, name);
        const fileNames = await dir.listFiles();
        if (fileNames.includes(lastName)) {
            return Neutralino.filesystem.removeFile(pathTo);
        }
        await Neutralino.filesystem.removeDirectory(pathTo);
        return;
    }
}

class SafariDirectoryManager {
    constructor(path = '', files) {
        this.path = path;
        this.files = files;
        this.name = getNameByPath(path);
    }
    async renameFile(oldFileName, newFileName) {
        return renameFileInDir(oldFileName, newFileName, this);
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

class RobustSelectDirectoryComponent {
    constructor() {
        this.error = new EventEmitter();
        this.directoryManagerChange = new EventEmitter();
    }
    getPickerId() {
        return this.pickerId || this.getId().replace(/[ -_]/g, '');
    }
    async onPathReload(path) {
        if (typeof Neutralino === 'object') {
            const dm = new NeutralinoDirectoryManager(path);
            this.directoryManagerChange.emit(this.directoryManager = dm);
        }
    }
    async selectPath() {
        const isNeu = typeof Neutralino === 'object';
        if (isNeu) {
            let response = await Neutralino.os.showFolderDialog();
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
                const boxDir = await window.showDirectoryPicker({
                    id: this.getPickerId(),
                    // id: this.getId(),
                    mode: 'readwrite'
                });
                const boxFiles = await directoryReadToArray(boxDir);
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
    }
    getId() {
        return 'robustFolderPicker-' + this.label;
    }
    showDirectoryPicker() {
        document.getElementById(this.getId())?.click();
    }
    // safari read directory
    async readInputDirectory(input) {
        if (!input.files) {
            this.error.emit(new Error('no directory with files selected'));
            return; // no files selected
        }
        const files = Object.entries(input.files).filter(([key]) => key != 'length').map(([_key, value]) => value);
        const dm = new SafariDirectoryManager('', files);
        this.directoryManagerChange.emit(this.directoryManager = dm);
    }
}
RobustSelectDirectoryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
RobustSelectDirectoryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<!-- search hints: reselect -->\n\n<input class=\"invisible pos-abs\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'robust-select-directory', template: "<!-- search hints: reselect -->\n\n<input class=\"invisible pos-abs\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n" }]
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
