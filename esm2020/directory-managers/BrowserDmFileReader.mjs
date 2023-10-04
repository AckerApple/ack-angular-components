import { readFileStream, readWriteFile } from "./readFileStream.function";
import { BaseDmFileReader } from "./DmFileReader";
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
    async readTextStream(callback, chunkSize = 1024, options) {
        const file = await this.getRealFile();
        return readFileStream(file, chunkSize, callback, options);
    }
    async readWriteTextStream(callback, chunkSize = 1024 * 1024, // 1 MB
    options) {
        const handle = this.file;
        return readWriteFile(this, handle, callback, chunkSize, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvd3NlckRtRmlsZVJlYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kaXJlY3RvcnktbWFuYWdlcnMvQnJvd3NlckRtRmlsZVJlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ3pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBK0MsTUFBTSxnQkFBZ0IsQ0FBQTtBQUc5RixNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBR3ZELFlBQ1MsSUFBaUMsRUFDakMsU0FBMkI7UUFFbEMsS0FBSyxFQUFFLENBQUE7UUFIQSxTQUFJLEdBQUosSUFBSSxDQUE2QjtRQUNqQyxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUdsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQ2xCLFFBQXdCLEVBQ3hCLFlBQW9CLElBQUksRUFDeEIsT0FBdUI7UUFFdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDckMsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDM0QsQ0FBQztJQUVELEtBQUssQ0FBQyxtQkFBbUIsQ0FDdkIsUUFBd0IsRUFDeEIsWUFBb0IsSUFBSSxHQUFHLElBQUksRUFBRSxPQUFPO0lBQ3hDLE9BQXVCO1FBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUE0QixDQUFBO1FBQ2hELE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FB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QTthQUNUO1FBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkRmlsZVN0cmVhbSwgcmVhZFdyaXRlRmlsZSB9IGZyb20gXCIuL3JlYWRGaWxlU3RyZWFtLmZ1bmN0aW9uXCJcbmltcG9ydCB7IEJhc2VEbUZpbGVSZWFkZXIsIERtRmlsZVJlYWRlciwgU3RyZWFtT3B0aW9ucywgc3RyZWFtQ2FsbGJhY2sgfSBmcm9tIFwiLi9EbUZpbGVSZWFkZXJcIlxuaW1wb3J0IHsgRGlyZWN0b3J5TWFuYWdlciB9IGZyb20gXCIuL0RpcmVjdG9yeU1hbmFnZXJzXCJcblxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEbUZpbGVSZWFkZXIgZXh0ZW5kcyBCYXNlRG1GaWxlUmVhZGVyIGltcGxlbWVudHMgRG1GaWxlUmVhZGVyIHtcbiAgbmFtZTogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGZpbGU6IEZpbGUgfCBGaWxlU3lzdGVtRmlsZUhhbmRsZSxcbiAgICBwdWJsaWMgZGlyZWN0b3J5OiBEaXJlY3RvcnlNYW5hZ2VyXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm5hbWUgPSBmaWxlLm5hbWVcbiAgfVxuXG4gIGFzeW5jIHN0YXRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldFJlYWxGaWxlKClcbiAgfVxuXG4gIGFzeW5jIHJlYWRUZXh0U3RyZWFtKFxuICAgIGNhbGxiYWNrOiBzdHJlYW1DYWxsYmFjayxcbiAgICBjaHVua1NpemU6IG51bWJlciA9IDEwMjQsXG4gICAgb3B0aW9ucz86IFN0cmVhbU9wdGlvbnMsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmdldFJlYWxGaWxlKClcbiAgICByZXR1cm4gcmVhZEZpbGVTdHJlYW0oZmlsZSwgY2h1bmtTaXplLCBjYWxsYmFjaywgb3B0aW9ucylcbiAgfVxuXG4gIGFzeW5jIHJlYWRXcml0ZVRleHRTdHJlYW0oXG4gICAgY2FsbGJhY2s6IHN0cmVhbUNhbGxiYWNrLFxuICAgIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQsIC8vIDEgTUJcbiAgICBvcHRpb25zPzogU3RyZWFtT3B0aW9ucyxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaGFuZGxlID0gdGhpcy5maWxlIGFzIEZpbGVTeXN0ZW1GaWxlSGFuZGxlXG4gICAgcmV0dXJuIHJlYWRXcml0ZUZpbGUodGhpcywgaGFuZGxlLCBjYWxsYmFjaywgY2h1bmtTaXplLCBvcHRpb25zKVxuICB9XG5cbiAgYXN5bmMgd3JpdGUoZmlsZVN0cmluZzogc3RyaW5nIHwgQXJyYXlCdWZmZXIpIHtcbiAgICBsZXQgd3JpdGFibGVTdHJlYW06IGFueVxuICAgIGNvbnN0IGxpa2VGaWxlOiBhbnkgPSB0aGlzLmZpbGVcbiAgICBjb25zdCBoYXNQZXJtaXNzaW9uID0gbGlrZUZpbGUucXVlcnlQZXJtaXNzaW9uICYmIGF3YWl0IGxpa2VGaWxlLnF1ZXJ5UGVybWlzc2lvbigpID09PSAnZ3JhbnRlZCdcblxuICAgIGlmICggaGFzUGVybWlzc2lvbiApIHtcbiAgICAgIHdyaXRhYmxlU3RyZWFtID0gYXdhaXQgbGlrZUZpbGUuY3JlYXRlV3JpdGFibGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXF1ZXN0IHdoZXJlIHRvIHNhdmVcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCctJykrJy1maWxlUGlja2VyJ1xuICAgICAgY29uc3Qgc2F2ZVBpY2tlck9wdGlvbnMgPSB7XG4gICAgICAgIHN1Z2dlc3RlZE5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgLypcbiAgICAgICAgLy8gdG9kbzogbWF5IG5lZWQgdG8gdXNlIG1pbWUgdHlwZXNcbiAgICAgICAgdHlwZXM6IFt7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICdKU09OJyxcbiAgICAgICAgICBhY2NlcHQ6IHtcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogWycuanNvbiddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1dLFxuICAgICAgICAqL1xuICAgICAgfVxuXG4gICAgICAvLyBiZWxvdywgdGhvdWdodCB0byByZW1lbWJlciBsYXN0IG1hdGNoaW5nIGZpbGUgKGkgdGhpbmsgZGF0YSB0eXBpbmcgaXMganVzdCBtaXNzaW5nIGZvciBpdClcbiAgICAgIDsoc2F2ZVBpY2tlck9wdGlvbnMgYXMgYW55KS5pZCA9IGlkLnNsaWNlKDAsIDMyKVxuXG4gICAgICBjb25zdCBoYW5kbGUgPSBhd2FpdCB3aW5kb3cuc2hvd1NhdmVGaWxlUGlja2VyKHNhdmVQaWNrZXJPcHRpb25zKVxuICAgICAgXG4gICAgICB3cml0YWJsZVN0cmVhbSA9IGF3YWl0IGhhbmRsZS5jcmVhdGVXcml0YWJsZSgpXG4gICAgfVxuXG5cbiAgICAvLyB3cml0ZSBvdXIgZmlsZVxuICAgIGF3YWl0IHdyaXRhYmxlU3RyZWFtLndyaXRlKCBmaWxlU3RyaW5nIClcblxuICAgIC8vIGNsb3NlIHRoZSBmaWxlIGFuZCB3cml0ZSB0aGUgY29udGVudHMgdG8gZGlzay5cbiAgICBhd2FpdCB3cml0YWJsZVN0cmVhbS5jbG9zZSgpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldFJlYWxGaWxlKCk6IFByb21pc2U8RmlsZT4ge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGUgYXMgYW55XG4gICAgcmV0dXJuIGZpbGUuZ2V0RmlsZSA/IGF3YWl0IGZpbGUuZ2V0RmlsZSgpIDogUHJvbWlzZS5yZXNvbHZlKGZpbGUpXG4gIH1cbiAgXG4gIG92ZXJyaWRlIHJlYWRBc1RleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlcywgcmVqKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmdldFJlYWxGaWxlKClcbiAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyXG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXMocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVqKGVycilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmVhZEFzRGF0YVVSTCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzLCByZWopID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmdldFJlYWxGaWxlKClcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSlcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSByZWFkZXIucmVzdWx0IGFzIHN0cmluZ1xuICAgICAgICAgIC8vIHJlbW92ZSBgZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxgXG4gICAgICAgICAgLy8gcmVtb3ZlIGBkYXRhOmltYWdlL3BuZztiYXNlNjQsYFxuICAgICAgICAgIC8vIGNvbnN0IHJlcGxhY2VkID0gcmVzdWx0LnJlcGxhY2UoL14uKywvLCcnKVxuICAgICAgICAgIHJlcyhyZXN1bHQpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZWooZXJyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==