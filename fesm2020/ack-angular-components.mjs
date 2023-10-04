import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file */
function readFileStream(file, chunkSize = 1024 * 1024, // 1MB,
eachString = (string) => undefined) {
    const fileSize = file.size;
    let offset = 0;
    let stopped = false;
    return new Promise((res, rej) => {
        const reader = new FileReader();
        const stop = () => {
            stopped = true;
            reader.abort();
        };
        const cancel = stop;
        reader.onload = (event) => {
            if (event.target?.result) {
                eachString(event.target.result, {
                    isLast: (offset + chunkSize) >= fileSize,
                    percent: offset / fileSize * 100,
                    offset,
                    stop,
                    cancel
                });
                // increment
                offset += chunkSize;
            }
            if (!stopped && offset < fileSize) {
                readSlice();
            }
            else {
                res();
            }
        };
        reader.onerror = rej;
        function readSlice() {
            const slice = file.slice(offset, offset + chunkSize);
            reader.readAsText(slice);
        }
        readSlice();
        // return () => reader.abort()
    });
}
async function readWriteFile$1(file, fileHandle, transformFn, // aka callback
chunkSize = 1024 * 1024) {
    const writableStream = await fileHandle.createWritable(); // Open a writable stream for the file
    const onString = async (string, stats) => {
        const originalStop = stats.stop;
        stats.stop = () => {
            originalStop(); // call the stop we are wrapping
            writableStream.close();
        };
        stats.cancel = () => {
            originalStop(); // call the stop we are wrapping
            writableStream.abort();
        };
        return writableStream.write(await transformFn(string, stats));
    };
    await file.readTextStream(onString, chunkSize);
    await writableStream.close();
    writableStream.truncate;
}

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
    async readTextStream(callback, chunkSize = 1024) {
        const file = await this.getRealFile();
        return readFileStream(file, chunkSize, callback);
    }
    async readWriteTextStream(callback, chunkSize = 1024 * 1024) {
        const handle = this.file;
        return readWriteFile$1(this, handle, callback, chunkSize);
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
                /*
                // todo: may need to use mime types
                types: [{
                  description: 'JSON',
                  accept: {
                    'application/json': ['.json'],
                  },
                }],
                */
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
                reader.readAsArrayBuffer;
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
                reader.onload = () => {
                    const result = reader.result;
                    // remove `data:application/json;base64,`
                    // remove `data:image/png;base64,`
                    // const replaced = result.replace(/^.+,/,'')
                    res(result);
                };
            }
            catch (err) {
                rej(err);
            }
        });
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
    const newFile = await copyFileInDir(oldFileName, newFileName, dir);
    await dir.removeEntry(oldFileName);
    return newFile;
}
async function copyFileInDir(oldFileName, newFileName, dir) {
    const oldFile = await dir.file(oldFileName);
    const data = await oldFile.readAsText();
    const newFile = await dir.file(newFileName, { create: true });
    await newFile.write(data);
    return newFile;
}
async function getDirForFilePath(path, fromDir, options) {
    const pathSplit = path.split(/\\|\//);
    pathSplit.pop(); // remove the file
    const pathWithoutFile = pathSplit.join('/');
    return await fromDir.getDirectory(pathWithoutFile, options);
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

function convertSlashes(string) {
    return string.replace('\\', '/');
}

const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
/** Read a file in streams awaiting a callback to process each stream before reading another */
async function readTextStream(filePath, callback, 
// Below, if number is too low, Neutralino witnessed will fail NE_RT_NATRTER (hopefully its not a specific number used versus how much is available to stream in targeted file)
chunkSize = 1024 * 18) {
    let stopped = false;
    const stop = () => {
        stopped = true;
    };
    return new Promise(async (res, rej) => {
        let offset = 0;
        const stats = await fs.getStats(filePath);
        const size = stats.size;
        let close = () => {
            Neutralino.events.off('openedFile', dataCallback);
            res(undefined);
            // prevent calling callbacks twice by redeclaring them
            const empty = () => undefined;
            close = empty;
            dataCallback = empty;
        };
        // main callback used to read each stream of data. On close of stream, its re-declared as an empty function
        let dataCallback = (evt) => {
            if (evt.detail.id != fileId) {
                return; // this call is not for us
            }
            switch (evt.detail.action) {
                case 'data':
                    const isLast = (offset + chunkSize) >= size;
                    const percent = offset / size * 100;
                    const string = evt.detail.data;
                    try {
                        // if callback return promise, wait for it
                        return Promise.resolve(callback(string, { offset, isLast, percent, stop, cancel: stop }))
                            .then(() => {
                            offset = offset + chunkSize; // increase for next iteration
                            // are we done or shall we trigger the next read?
                            isLast || stopped ? close() : read();
                        });
                    }
                    catch (err) {
                        rej(err);
                        return close(); // error should force everything to stop
                    }
                case 'end':
                    close(); // indication of done by Neutralino
                    return;
            }
        };
        // used at every time we are ready to continue reading
        const read = async () => {
            try {
                const ableToRead = size - (offset + chunkSize);
                // prevent a trying to read more than their is file (otherwise odd trailing characters)
                if (ableToRead < 0) {
                    chunkSize = chunkSize + ableToRead;
                }
                // no await here needed (dataCallback will be called)
                await Neutralino.filesystem.updateOpenedFile(fileId, 'read', chunkSize);
            }
            catch (err) {
                rej(err);
                close();
            }
        };
        // Create a callback calling callback so incase we need to prevent further calls we can switch out the first callback
        const realCallback = (evt) => dataCallback(evt);
        // start the actual processing
        Neutralino.events.on('openedFile', realCallback);
        const fileId = await Neutralino.filesystem.openFile(filePath);
        read();
    });
}
/** Read a file in streams awaiting a callback to provide a string to write as new content for the original read file
 * 1. A blank file is created
 * 2. Original file is read in streams
 * 3. Result from callback is appended to the file in step 1
 * 4. When all of file is read we rename the original file
 * 5. The file we append all results to, is renamed to the original files name
 * 6. The original file, that was renamed, is now deleted
 * - All of the above must be performed as Neutralino does not support stream writing like the browser does
*/
async function readWriteFile(filePath, callback, chunkSize = 1024 * 18 // Too low a number, can error. More details in file search for "chunkSize" in this file
) {
    const cloneFullPath = filePath + '.writing';
    const renameFullPath = filePath + '.original';
    // create an empty file we will stream results into
    await Neutralino.filesystem.writeFile(cloneFullPath, '');
    // create callback that will handle each part of the stream
    const midware = (string, stats) => {
        stats.cancel = () => {
            stats.stop();
            Neutralino.filesystem.removeFile(renameFullPath); // remove the safety file
            Neutralino.filesystem.removeFile(cloneFullPath); // remove the clone.writing file we created
        };
        const newString = callback(string, stats);
        // no await
        return Neutralino.filesystem.appendFile(cloneFullPath, newString);
    };
    // stream the entire file
    await readTextStream(filePath, midware, chunkSize);
    // rename original file just incase any issues with next step(s)
    await Neutralino.filesystem.moveFile(filePath, renameFullPath);
    // rename the file we stream wrote which ends in ".writing"
    await Neutralino.filesystem.moveFile(cloneFullPath, filePath);
    // delete original file because we are done which ends in '.original'
    await Neutralino.filesystem.removeFile(renameFullPath);
}

class NeutralinoDmFileReader extends BaseDmFileReader {
    constructor(filePath, directory) {
        super();
        this.filePath = filePath;
        this.directory = directory;
        this.name = filePath.split(/\\|\//).pop();
    }
    async readTextStream(callback, chunkSize = 82944 // 1024 * 18 because low numbers cause issues
    ) {
        return readTextStream(this.filePath, callback, chunkSize);
    }
    async stats() {
        const stats = await fs.getStats(this.filePath);
        const castedStats = { ...stats };
        castedStats.name = castedStats.name || this.name;
        castedStats.lastModified = stats.modifiedAt;
        castedStats.type = stats.isFile ? 'file' : 'directory';
        return castedStats;
    }
    readAsText() {
        return fs.readFile(this.filePath); // .toString()
    }
    async readAsDataURL() {
        const data = await fs.readBinaryFile(this.filePath);
        const view = new Uint8Array(data);
        const decoded = String.fromCharCode(...view);
        //const decoder = new TextDecoder('utf8')
        //const decoded = decoder.decode(view)
        const b64encoded = btoa(decoded);
        const ext = this.filePath.split('.').pop();
        const dataType = getMimeType(ext);
        const url = `data:${dataType};base64,` + b64encoded; // remove `application/json;base64,`
        return url;
    }
    /**
     * 1. Creates a file of a similar name and reads from source file
     * 2. Writes to created via append commands
     * 3. The original file is renamed on stream end
     * 4. The new file is named to the original and then original file is then deleted */
    async readWriteTextStream(callback, chunkSize = 1024 * 1024) {
        const pathTo = this.directory.path;
        const fullPath = pathTo + '/' + this.name;
        return readWriteFile(fullPath, callback, chunkSize);
    }
    async write(fileString) {
        return fs.writeFile(this.filePath, fileString);
    }
}
function getMimeType(ext) {
    switch (ext) {
        case 'png':
            return 'image/png';
        case 'jpeg':
        case 'jpg':
            return 'image/png';
    }
    return 'application/json';
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

class SafariDirectoryManager {
    constructor(path = '', files) {
        this.path = path;
        this.files = files;
        this.name = getNameByPath(path);
    }
    async copyFile(oldFileName, newFileName) {
        return copyFileInDir(oldFileName, newFileName, this);
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
            const options = {};
            if (this.reloadPath) {
                options.defaultPath = this.reloadPath;
            }
            let response = await Neutralino.os.showFolderDialog('Select LaunchBox directory', options);
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
        if (this.showDirectoryPicker) {
            this.showDirectoryPicker();
            return;
        }
        let message = 'Cannot find supporting functionality to display a directory picker.';
        if (window.location.host.includes('0.0.0.0')) {
            message = message + ' Try using localhost instead of 0.0.0.0';
        }
        throw new Error(message);
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
RobustSelectDirectoryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'robust-select-directory', template: "<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n" }]
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
