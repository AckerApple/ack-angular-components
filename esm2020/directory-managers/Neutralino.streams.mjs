export const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
/** Read a file in streams awaiting a callback to process each stream before reading another */
export async function readTextStream(filePath, callback, 
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
export async function readWriteFile(filePath, callback, chunkSize = 1024 * 18 // Too low a number, can error. More details in file search for "chunkSize" in this file
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV1dHJhbGluby5zdHJlYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vLnN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBbUIsQ0FBQTtBQUU5RiwrRkFBK0Y7QUFDL0YsTUFBTSxDQUFDLEtBQUssVUFBVSxjQUFjLENBQ2xDLFFBQWdCLEVBQ2hCLFFBQXdCO0FBQ3hCLCtLQUErSztBQUMvSyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUU7SUFFckIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0lBQ25CLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRTtRQUNoQixPQUFPLEdBQUcsSUFBSSxDQUFBO0lBQ2hCLENBQUMsQ0FBQTtJQUVELE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNwQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDZCxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQTtRQUV2QixJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7WUFDZixVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUE7WUFDakQsR0FBRyxDQUFFLFNBQVMsQ0FBRSxDQUFBO1lBRWhCLHNEQUFzRDtZQUN0RCxNQUFNLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUE7WUFDN0IsS0FBSyxHQUFHLEtBQUssQ0FBQTtZQUNiLFlBQVksR0FBRyxLQUFLLENBQUE7UUFD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QUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUV4RCwyREFBMkQ7SUFDM0QsTUFBTSxPQUFPLEdBQW1CLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2hELEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNaLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFBLENBQUMseUJBQXlCO1lBQzFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFBLENBQUMsMkNBQTJDO1FBQzdGLENBQUMsQ0FBQTtRQUVELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFekMsV0FBVztRQUNYLE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ25FLENBQUMsQ0FBQTtJQUVELHlCQUF5QjtJQUN6QixNQUFNLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBRWxELGdFQUFnRTtJQUNoRSxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQTtJQUU5RCwyREFBMkQ7SUFDM0QsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFFN0QscUVBQXFFO0lBQ3JFLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElOZXV0cmFsaW5vLCBJTmV1dHJhbGlub0ZzIH0gZnJvbSBcIi4vTmV1dHJhbGluby51dGlsc1wiXG5pbXBvcnQgeyBzdHJlYW1DYWxsYmFjayB9IGZyb20gXCIuL0RtRmlsZVJlYWRlclwiXG5cbmRlY2xhcmUgY29uc3QgTmV1dHJhbGlubzogSU5ldXRyYWxpbm9cbmV4cG9ydCBjb25zdCBmcyA9IHR5cGVvZiBOZXV0cmFsaW5vID09PSAnb2JqZWN0JyA/IE5ldXRyYWxpbm8uZmlsZXN5c3RlbSA6IHt9IGFzIElOZXV0cmFsaW5vRnNcblxuLyoqIFJlYWQgYSBmaWxlIGluIHN0cmVhbXMgYXdhaXRpbmcgYSBjYWxsYmFjayB0byBwcm9jZXNzIGVhY2ggc3RyZWFtIGJlZm9yZSByZWFkaW5nIGFub3RoZXIgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkVGV4dFN0cmVhbShcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgY2FsbGJhY2s6IHN0cmVhbUNhbGxiYWNrLFxuICAvLyBCZWxvdywgaWYgbnVtYmVyIGlzIHRvbyBsb3csIE5ldXRyYWxpbm8gd2l0bmVzc2VkIHdpbGwgZmFpbCBORV9SVF9OQVRSVEVSIChob3BlZnVsbHkgaXRzIG5vdCBhIHNwZWNpZmljIG51bWJlciB1c2VkIHZlcnN1cyBob3cgbXVjaCBpcyBhdmFpbGFibGUgdG8gc3RyZWFtIGluIHRhcmdldGVkIGZpbGUpXG4gIGNodW5rU2l6ZSA9IDEwMjQgKiAxOCxcbik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgc3RvcHBlZCA9IGZhbHNlXG4gIGNvbnN0IHN0b3AgPSAoKSA9PiB7XG4gICAgc3RvcHBlZCA9IHRydWVcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzLCByZWopID0+IHtcbiAgICBsZXQgb2Zmc2V0ID0gMFxuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMuZ2V0U3RhdHMoZmlsZVBhdGgpXG4gICAgY29uc3Qgc2l6ZSA9IHN0YXRzLnNpemVcblxuICAgIGxldCBjbG9zZSA9ICgpID0+IHtcbiAgICAgIE5ldXRyYWxpbm8uZXZlbnRzLm9mZignb3BlbmVkRmlsZScsIGRhdGFDYWxsYmFjaylcbiAgICAgIHJlcyggdW5kZWZpbmVkIClcbiAgICAgIFxuICAgICAgLy8gcHJldmVudCBjYWxsaW5nIGNhbGxiYWNrcyB0d2ljZSBieSByZWRlY2xhcmluZyB0aGVtXG4gICAgICBjb25zdCBlbXB0eSA9ICgpID0+IHVuZGVmaW5lZFxuICAgICAgY2xvc2UgPSBlbXB0eVxuICAgICAgZGF0YUNhbGxiYWNrID0gZW1wdHlcbiAgICB9XG5cbiAgICAvLyBtYWluIGNhbGxiYWNrIHVzZWQgdG8gcmVhZCBlYWNoIHN0cmVhbSBvZiBkYXRhLiBPbiBjbG9zZSBvZiBzdHJlYW0sIGl0cyByZS1kZWNsYXJlZCBhcyBhbiBlbXB0eSBmdW5jdGlvblxuICAgIGxldCBkYXRhQ2FsbGJhY2sgPSAoZXZ0OiBhbnkpID0+IHtcbiAgICAgIGlmKGV2dC5kZXRhaWwuaWQgIT0gZmlsZUlkKSB7XG4gICAgICAgIHJldHVybiAvLyB0aGlzIGNhbGwgaXMgbm90IGZvciB1c1xuICAgICAgfVxuXG4gICAgICBzd2l0Y2goZXZ0LmRldGFpbC5hY3Rpb24pIHtcbiAgICAgICAgY2FzZSAnZGF0YSc6XG4gICAgICAgICAgY29uc3QgaXNMYXN0ID0gKG9mZnNldCArIGNodW5rU2l6ZSkgPj0gc2l6ZVxuICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSBvZmZzZXQgLyBzaXplICogMTAwXG4gICAgICAgICAgY29uc3Qgc3RyaW5nID0gZXZ0LmRldGFpbC5kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGlmIGNhbGxiYWNrIHJldHVybiBwcm9taXNlLCB3YWl0IGZvciBpdFxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggY2FsbGJhY2soc3RyaW5nLCB7IG9mZnNldCwgaXNMYXN0LCBwZXJjZW50LCBzdG9wLCBjYW5jZWw6IHN0b3AgfSkgKVxuICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ICsgY2h1bmtTaXplIC8vIGluY3JlYXNlIGZvciBuZXh0IGl0ZXJhdGlvblxuXG4gICAgICAgICAgICAgICAgLy8gYXJlIHdlIGRvbmUgb3Igc2hhbGwgd2UgdHJpZ2dlciB0aGUgbmV4dCByZWFkP1xuICAgICAgICAgICAgICAgIGlzTGFzdCB8fCBzdG9wcGVkID8gY2xvc2UoKSA6IHJlYWQoKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVqKGVycilcbiAgICAgICAgICAgIHJldHVybiBjbG9zZSgpIC8vIGVycm9yIHNob3VsZCBmb3JjZSBldmVyeXRoaW5nIHRvIHN0b3BcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgY2xvc2UoKSAvLyBpbmRpY2F0aW9uIG9mIGRvbmUgYnkgTmV1dHJhbGlub1xuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHVzZWQgYXQgZXZlcnkgdGltZSB3ZSBhcmUgcmVhZHkgdG8gY29udGludWUgcmVhZGluZ1xuICAgIGNvbnN0IHJlYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhYmxlVG9SZWFkID0gc2l6ZSAtIChvZmZzZXQgKyBjaHVua1NpemUpXG4gICAgICAgIC8vIHByZXZlbnQgYSB0cnlpbmcgdG8gcmVhZCBtb3JlIHRoYW4gdGhlaXIgaXMgZmlsZSAob3RoZXJ3aXNlIG9kZCB0cmFpbGluZyBjaGFyYWN0ZXJzKVxuICAgICAgICBpZiAoIGFibGVUb1JlYWQgPCAwICkge1xuICAgICAgICAgIGNodW5rU2l6ZSA9IGNodW5rU2l6ZSArIGFibGVUb1JlYWRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vIGF3YWl0IGhlcmUgbmVlZGVkIChkYXRhQ2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQpXG4gICAgICAgIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS51cGRhdGVPcGVuZWRGaWxlKGZpbGVJZCwgJ3JlYWQnLCBjaHVua1NpemUpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVqKGVycilcbiAgICAgICAgY2xvc2UoKVxuICAgICAgfSAgXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgY2FsbGJhY2sgY2FsbGluZyBjYWxsYmFjayBzbyBpbmNhc2Ugd2UgbmVlZCB0byBwcmV2ZW50IGZ1cnRoZXIgY2FsbHMgd2UgY2FuIHN3aXRjaCBvdXQgdGhlIGZpcnN0IGNhbGxiYWNrXG4gICAgY29uc3QgcmVhbENhbGxiYWNrID0gKGV2dDogYW55KSA9PiBkYXRhQ2FsbGJhY2soZXZ0KVxuXG4gICAgLy8gc3RhcnQgdGhlIGFjdHVhbCBwcm9jZXNzaW5nXG4gICAgTmV1dHJhbGluby5ldmVudHMub24oJ29wZW5lZEZpbGUnLCByZWFsQ2FsbGJhY2spXG4gICAgY29uc3QgZmlsZUlkID0gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLm9wZW5GaWxlKCBmaWxlUGF0aCApXG4gICAgcmVhZCgpXG4gIH0pXG59ICBcblxuLyoqIFJlYWQgYSBmaWxlIGluIHN0cmVhbXMgYXdhaXRpbmcgYSBjYWxsYmFjayB0byBwcm92aWRlIGEgc3RyaW5nIHRvIHdyaXRlIGFzIG5ldyBjb250ZW50IGZvciB0aGUgb3JpZ2luYWwgcmVhZCBmaWxlXG4gKiAxLiBBIGJsYW5rIGZpbGUgaXMgY3JlYXRlZFxuICogMi4gT3JpZ2luYWwgZmlsZSBpcyByZWFkIGluIHN0cmVhbXNcbiAqIDMuIFJlc3VsdCBmcm9tIGNhbGxiYWNrIGlzIGFwcGVuZGVkIHRvIHRoZSBmaWxlIGluIHN0ZXAgMVxuICogNC4gV2hlbiBhbGwgb2YgZmlsZSBpcyByZWFkIHdlIHJlbmFtZSB0aGUgb3JpZ2luYWwgZmlsZVxuICogNS4gVGhlIGZpbGUgd2UgYXBwZW5kIGFsbCByZXN1bHRzIHRvLCBpcyByZW5hbWVkIHRvIHRoZSBvcmlnaW5hbCBmaWxlcyBuYW1lXG4gKiA2LiBUaGUgb3JpZ2luYWwgZmlsZSwgdGhhdCB3YXMgcmVuYW1lZCwgaXMgbm93IGRlbGV0ZWRcbiAqIC0gQWxsIG9mIHRoZSBhYm92ZSBtdXN0IGJlIHBlcmZvcm1lZCBhcyBOZXV0cmFsaW5vIGRvZXMgbm90IHN1cHBvcnQgc3RyZWFtIHdyaXRpbmcgbGlrZSB0aGUgYnJvd3NlciBkb2VzXG4qL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRXcml0ZUZpbGUoXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBzdHJlYW1DYWxsYmFjayxcbiAgY2h1bmtTaXplOiBudW1iZXIgPSAxMDI0ICogMTggLy8gVG9vIGxvdyBhIG51bWJlciwgY2FuIGVycm9yLiBNb3JlIGRldGFpbHMgaW4gZmlsZSBzZWFyY2ggZm9yIFwiY2h1bmtTaXplXCIgaW4gdGhpcyBmaWxlXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgY2xvbmVGdWxsUGF0aCA9IGZpbGVQYXRoICsgJy53cml0aW5nJ1xuICBjb25zdCByZW5hbWVGdWxsUGF0aCA9IGZpbGVQYXRoICsgJy5vcmlnaW5hbCdcblxuICAvLyBjcmVhdGUgYW4gZW1wdHkgZmlsZSB3ZSB3aWxsIHN0cmVhbSByZXN1bHRzIGludG9cbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLndyaXRlRmlsZShjbG9uZUZ1bGxQYXRoLCAnJylcblxuICAvLyBjcmVhdGUgY2FsbGJhY2sgdGhhdCB3aWxsIGhhbmRsZSBlYWNoIHBhcnQgb2YgdGhlIHN0cmVhbVxuICBjb25zdCBtaWR3YXJlOiBzdHJlYW1DYWxsYmFjayA9IChzdHJpbmcsIHN0YXRzKSA9PiB7XG4gICAgc3RhdHMuY2FuY2VsID0gKCkgPT4ge1xuICAgICAgc3RhdHMuc3RvcCgpXG4gICAgICBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVtb3ZlRmlsZShyZW5hbWVGdWxsUGF0aCkgLy8gcmVtb3ZlIHRoZSBzYWZldHkgZmlsZVxuICAgICAgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlbW92ZUZpbGUoY2xvbmVGdWxsUGF0aCkgLy8gcmVtb3ZlIHRoZSBjbG9uZS53cml0aW5nIGZpbGUgd2UgY3JlYXRlZFxuICAgIH1cblxuICAgIGNvbnN0IG5ld1N0cmluZyA9IGNhbGxiYWNrKHN0cmluZywgc3RhdHMpXG4gICAgXG4gICAgLy8gbm8gYXdhaXRcbiAgICByZXR1cm4gTmV1dHJhbGluby5maWxlc3lzdGVtLmFwcGVuZEZpbGUoY2xvbmVGdWxsUGF0aCwgbmV3U3RyaW5nKVxuICB9XG5cbiAgLy8gc3RyZWFtIHRoZSBlbnRpcmUgZmlsZVxuICBhd2FpdCByZWFkVGV4dFN0cmVhbShmaWxlUGF0aCwgbWlkd2FyZSwgY2h1bmtTaXplKVxuXG4gIC8vIHJlbmFtZSBvcmlnaW5hbCBmaWxlIGp1c3QgaW5jYXNlIGFueSBpc3N1ZXMgd2l0aCBuZXh0IHN0ZXAocylcbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLm1vdmVGaWxlKGZpbGVQYXRoLCByZW5hbWVGdWxsUGF0aClcblxuICAvLyByZW5hbWUgdGhlIGZpbGUgd2Ugc3RyZWFtIHdyb3RlIHdoaWNoIGVuZHMgaW4gXCIud3JpdGluZ1wiXG4gIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5tb3ZlRmlsZShjbG9uZUZ1bGxQYXRoLCBmaWxlUGF0aClcblxuICAvLyBkZWxldGUgb3JpZ2luYWwgZmlsZSBiZWNhdXNlIHdlIGFyZSBkb25lIHdoaWNoIGVuZHMgaW4gJy5vcmlnaW5hbCdcbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlbW92ZUZpbGUocmVuYW1lRnVsbFBhdGgpXG59Il19