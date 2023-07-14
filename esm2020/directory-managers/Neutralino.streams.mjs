export const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
/** Read a file in streams awaiting a callback to process each stream before reading another */
export async function readTextStream(filePath, callback, 
// Below, if number is too low, Neutralino witnessed will fail NE_RT_NATRTER (hopefully its not a specific number used versus how much is available to stream in targeted file)
chunkSize = 1024 * 18) {
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
                        return Promise.resolve(callback(string, { offset, isLast, percent }))
                            .then(() => {
                            offset = offset + chunkSize; // increase for next iteration
                            // are we done or shall we trigger the next read?
                            isLast ? close() : read();
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
    // create an empty file we will stream results into
    await Neutralino.filesystem.writeFile(cloneFullPath, '');
    // create callback that will handle each part of the stream
    const midware = (string, stats) => {
        const newString = callback(string, stats);
        // no await
        return Neutralino.filesystem.appendFile(cloneFullPath, newString);
    };
    // stream the entire file
    await readTextStream(filePath, midware, chunkSize);
    // rename original file just incase any issues with next step(s)
    const renameFullPath = filePath + '.original';
    await Neutralino.filesystem.moveFile(filePath, renameFullPath);
    // rename the file we stream wrote
    await Neutralino.filesystem.moveFile(cloneFullPath, filePath);
    // delete original file because we are done
    await Neutralino.filesystem.removeFile(renameFullPath);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV1dHJhbGluby5zdHJlYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vLnN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBbUIsQ0FBQTtBQUU5RiwrRkFBK0Y7QUFDL0YsTUFBTSxDQUFDLEtBQUssVUFBVSxjQUFjLENBQ2xDLFFBQWdCLEVBQ2hCLFFBQXdCO0FBQ3hCLCtLQUErSztBQUMvSyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUU7SUFFckIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3BDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUNkLE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN6QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBO1FBRXZCLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRTtZQUNmLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUNqRCxHQUFHLENBQUUsU0FBUyxDQUFFLENBQUE7WUFFaEIsc0RBQXNEO1lBQ3RELE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQTtZQUM3QixLQUFLLEdBQUcsS0FBSyxDQUFBO1lBQ2IsWUFBWSxHQUFHLEtBQUssQ0FBQTtRQUN0QixDQUFDLENBQUE7UUFFRCwyR0FBMkc7UUFDM0csSUFBSSxZQUFZLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRTtZQUM5QixJQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJ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TyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDbkUsQ0FBQyxDQUFBO0lBRUQseUJBQXlCO0lBQ3pCLE1BQU0sY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFFbEQsZ0VBQWdFO0lBQ2hFLE1BQU0sY0FBYyxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUE7SUFDN0MsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFFOUQsa0NBQWtDO0lBQ2xDLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBRTdELDJDQUEyQztJQUMzQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ3hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTmV1dHJhbGlubywgSU5ldXRyYWxpbm9GcyB9IGZyb20gXCIuL05ldXRyYWxpbm8udXRpbHNcIlxuaW1wb3J0IHsgc3RyZWFtQ2FsbGJhY2sgfSBmcm9tIFwiLi9EbUZpbGVSZWFkZXJcIlxuXG5kZWNsYXJlIGNvbnN0IE5ldXRyYWxpbm86IElOZXV0cmFsaW5vXG5leHBvcnQgY29uc3QgZnMgPSB0eXBlb2YgTmV1dHJhbGlubyA9PT0gJ29iamVjdCcgPyBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0gOiB7fSBhcyBJTmV1dHJhbGlub0ZzXG5cbi8qKiBSZWFkIGEgZmlsZSBpbiBzdHJlYW1zIGF3YWl0aW5nIGEgY2FsbGJhY2sgdG8gcHJvY2VzcyBlYWNoIHN0cmVhbSBiZWZvcmUgcmVhZGluZyBhbm90aGVyICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFRleHRTdHJlYW0oXG4gIGZpbGVQYXRoOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiBzdHJlYW1DYWxsYmFjayxcbiAgLy8gQmVsb3csIGlmIG51bWJlciBpcyB0b28gbG93LCBOZXV0cmFsaW5vIHdpdG5lc3NlZCB3aWxsIGZhaWwgTkVfUlRfTkFUUlRFUiAoaG9wZWZ1bGx5IGl0cyBub3QgYSBzcGVjaWZpYyBudW1iZXIgdXNlZCB2ZXJzdXMgaG93IG11Y2ggaXMgYXZhaWxhYmxlIHRvIHN0cmVhbSBpbiB0YXJnZXRlZCBmaWxlKVxuICBjaHVua1NpemUgPSAxMDI0ICogMTgsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXMsIHJlaikgPT4ge1xuICAgIGxldCBvZmZzZXQgPSAwXG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5nZXRTdGF0cyhmaWxlUGF0aClcbiAgICBjb25zdCBzaXplID0gc3RhdHMuc2l6ZVxuXG4gICAgbGV0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgTmV1dHJhbGluby5ldmVudHMub2ZmKCdvcGVuZWRGaWxlJywgZGF0YUNhbGxiYWNrKVxuICAgICAgcmVzKCB1bmRlZmluZWQgKVxuICAgICAgXG4gICAgICAvLyBwcmV2ZW50IGNhbGxpbmcgY2FsbGJhY2tzIHR3aWNlIGJ5IHJlZGVjbGFyaW5nIHRoZW1cbiAgICAgIGNvbnN0IGVtcHR5ID0gKCkgPT4gdW5kZWZpbmVkXG4gICAgICBjbG9zZSA9IGVtcHR5XG4gICAgICBkYXRhQ2FsbGJhY2sgPSBlbXB0eVxuICAgIH1cblxuICAgIC8vIG1haW4gY2FsbGJhY2sgdXNlZCB0byByZWFkIGVhY2ggc3RyZWFtIG9mIGRhdGEuIE9uIGNsb3NlIG9mIHN0cmVhbSwgaXRzIHJlLWRlY2xhcmVkIGFzIGFuIGVtcHR5IGZ1bmN0aW9uXG4gICAgbGV0IGRhdGFDYWxsYmFjayA9IChldnQ6IGFueSkgPT4ge1xuICAgICAgaWYoZXZ0LmRldGFpbC5pZCAhPSBmaWxlSWQpIHtcbiAgICAgICAgcmV0dXJuIC8vIHRoaXMgY2FsbCBpcyBub3QgZm9yIHVzXG4gICAgICB9XG5cbiAgICAgIHN3aXRjaChldnQuZGV0YWlsLmFjdGlvbikge1xuICAgICAgICBjYXNlICdkYXRhJzpcbiAgICAgICAgICBjb25zdCBpc0xhc3QgPSAob2Zmc2V0ICsgY2h1bmtTaXplKSA+PSBzaXplXG4gICAgICAgICAgY29uc3QgcGVyY2VudCA9IG9mZnNldCAvIHNpemUgKiAxMDBcbiAgICAgICAgICBjb25zdCBzdHJpbmcgPSBldnQuZGV0YWlsLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gaWYgY2FsbGJhY2sgcmV0dXJuIHByb21pc2UsIHdhaXQgZm9yIGl0XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBjYWxsYmFjayhzdHJpbmcsIHsgb2Zmc2V0LCBpc0xhc3QsIHBlcmNlbnQgfSkgKVxuICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ICsgY2h1bmtTaXplIC8vIGluY3JlYXNlIGZvciBuZXh0IGl0ZXJhdGlvblxuXG4gICAgICAgICAgICAgICAgLy8gYXJlIHdlIGRvbmUgb3Igc2hhbGwgd2UgdHJpZ2dlciB0aGUgbmV4dCByZWFkP1xuICAgICAgICAgICAgICAgIGlzTGFzdCA/IGNsb3NlKCkgOiByZWFkKClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJlaihlcnIpXG4gICAgICAgICAgICByZXR1cm4gY2xvc2UoKSAvLyBlcnJvciBzaG91bGQgZm9yY2UgZXZlcnl0aGluZyB0byBzdG9wXG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgIGNsb3NlKCkgLy8gaW5kaWNhdGlvbiBvZiBkb25lIGJ5IE5ldXRyYWxpbm9cbiAgICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2VkIGF0IGV2ZXJ5IHRpbWUgd2UgYXJlIHJlYWR5IHRvIGNvbnRpbnVlIHJlYWRpbmdcbiAgICBjb25zdCByZWFkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWJsZVRvUmVhZCA9IHNpemUgLSAob2Zmc2V0ICsgY2h1bmtTaXplKVxuICAgICAgICAvLyBwcmV2ZW50IGEgdHJ5aW5nIHRvIHJlYWQgbW9yZSB0aGFuIHRoZWlyIGlzIGZpbGUgKG90aGVyd2lzZSBvZGQgdHJhaWxpbmcgY2hhcmFjdGVycylcbiAgICAgICAgaWYgKCBhYmxlVG9SZWFkIDwgMCApIHtcbiAgICAgICAgICBjaHVua1NpemUgPSBjaHVua1NpemUgKyBhYmxlVG9SZWFkXG4gICAgICAgIH1cblxuICAgICAgICAvLyBubyBhd2FpdCBoZXJlIG5lZWRlZCAoZGF0YUNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkKVxuICAgICAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0udXBkYXRlT3BlbmVkRmlsZShmaWxlSWQsICdyZWFkJywgY2h1bmtTaXplKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJlaihlcnIpXG4gICAgICAgIGNsb3NlKClcbiAgICAgIH0gIFxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNhbGxiYWNrIGNhbGxpbmcgY2FsbGJhY2sgc28gaW5jYXNlIHdlIG5lZWQgdG8gcHJldmVudCBmdXJ0aGVyIGNhbGxzIHdlIGNhbiBzd2l0Y2ggb3V0IHRoZSBmaXJzdCBjYWxsYmFja1xuICAgIGNvbnN0IHJlYWxDYWxsYmFjayA9IChldnQ6IGFueSkgPT4gZGF0YUNhbGxiYWNrKGV2dClcblxuICAgIC8vIHN0YXJ0IHRoZSBhY3R1YWwgcHJvY2Vzc2luZ1xuICAgIE5ldXRyYWxpbm8uZXZlbnRzLm9uKCdvcGVuZWRGaWxlJywgcmVhbENhbGxiYWNrKVxuICAgIGNvbnN0IGZpbGVJZCA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5vcGVuRmlsZSggZmlsZVBhdGggKVxuICAgIHJlYWQoKVxuICB9KVxufSAgXG5cbi8qKiBSZWFkIGEgZmlsZSBpbiBzdHJlYW1zIGF3YWl0aW5nIGEgY2FsbGJhY2sgdG8gcHJvdmlkZSBhIHN0cmluZyB0byB3cml0ZSBhcyBuZXcgY29udGVudCBmb3IgdGhlIG9yaWdpbmFsIHJlYWQgZmlsZVxuICogMS4gQSBibGFuayBmaWxlIGlzIGNyZWF0ZWRcbiAqIDIuIE9yaWdpbmFsIGZpbGUgaXMgcmVhZCBpbiBzdHJlYW1zXG4gKiAzLiBSZXN1bHQgZnJvbSBjYWxsYmFjayBpcyBhcHBlbmRlZCB0byB0aGUgZmlsZSBpbiBzdGVwIDFcbiAqIDQuIFdoZW4gYWxsIG9mIGZpbGUgaXMgcmVhZCB3ZSByZW5hbWUgdGhlIG9yaWdpbmFsIGZpbGVcbiAqIDUuIFRoZSBmaWxlIHdlIGFwcGVuZCBhbGwgcmVzdWx0cyB0bywgaXMgcmVuYW1lZCB0byB0aGUgb3JpZ2luYWwgZmlsZXMgbmFtZVxuICogNi4gVGhlIG9yaWdpbmFsIGZpbGUsIHRoYXQgd2FzIHJlbmFtZWQsIGlzIG5vdyBkZWxldGVkXG4gKiAtIEFsbCBvZiB0aGUgYWJvdmUgbXVzdCBiZSBwZXJmb3JtZWQgYXMgTmV1dHJhbGlubyBkb2VzIG5vdCBzdXBwb3J0IHN0cmVhbSB3cml0aW5nIGxpa2UgdGhlIGJyb3dzZXIgZG9lc1xuKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkV3JpdGVGaWxlKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBjYWxsYmFjazogc3RyZWFtQ2FsbGJhY2ssXG4gIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDE4IC8vIFRvbyBsb3cgYSBudW1iZXIsIGNhbiBlcnJvci4gTW9yZSBkZXRhaWxzIGluIGZpbGUgc2VhcmNoIGZvciBcImNodW5rU2l6ZVwiIGluIHRoaXMgZmlsZVxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGNsb25lRnVsbFBhdGggPSBmaWxlUGF0aCArICcud3JpdGluZydcblxuICAvLyBjcmVhdGUgYW4gZW1wdHkgZmlsZSB3ZSB3aWxsIHN0cmVhbSByZXN1bHRzIGludG9cbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLndyaXRlRmlsZShjbG9uZUZ1bGxQYXRoLCAnJylcblxuICAvLyBjcmVhdGUgY2FsbGJhY2sgdGhhdCB3aWxsIGhhbmRsZSBlYWNoIHBhcnQgb2YgdGhlIHN0cmVhbVxuICBjb25zdCBtaWR3YXJlOiBzdHJlYW1DYWxsYmFjayA9IChzdHJpbmcsIHN0YXRzKSA9PiB7XG4gICAgY29uc3QgbmV3U3RyaW5nID0gY2FsbGJhY2soc3RyaW5nLCBzdGF0cylcbiAgICBcbiAgICAvLyBubyBhd2FpdFxuICAgIHJldHVybiBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uYXBwZW5kRmlsZShjbG9uZUZ1bGxQYXRoLCBuZXdTdHJpbmcpXG4gIH1cblxuICAvLyBzdHJlYW0gdGhlIGVudGlyZSBmaWxlXG4gIGF3YWl0IHJlYWRUZXh0U3RyZWFtKGZpbGVQYXRoLCBtaWR3YXJlLCBjaHVua1NpemUpXG5cbiAgLy8gcmVuYW1lIG9yaWdpbmFsIGZpbGUganVzdCBpbmNhc2UgYW55IGlzc3VlcyB3aXRoIG5leHQgc3RlcChzKVxuICBjb25zdCByZW5hbWVGdWxsUGF0aCA9IGZpbGVQYXRoICsgJy5vcmlnaW5hbCdcbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLm1vdmVGaWxlKGZpbGVQYXRoLCByZW5hbWVGdWxsUGF0aClcblxuICAvLyByZW5hbWUgdGhlIGZpbGUgd2Ugc3RyZWFtIHdyb3RlXG4gIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5tb3ZlRmlsZShjbG9uZUZ1bGxQYXRoLCBmaWxlUGF0aClcblxuICAvLyBkZWxldGUgb3JpZ2luYWwgZmlsZSBiZWNhdXNlIHdlIGFyZSBkb25lXG4gIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZW1vdmVGaWxlKHJlbmFtZUZ1bGxQYXRoKVxufSJdfQ==