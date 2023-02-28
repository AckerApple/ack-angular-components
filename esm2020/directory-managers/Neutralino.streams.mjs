export const fs = typeof Neutralino === 'object' ? Neutralino.filesystem : {};
/** Read a file in streams awaiting a callback to process each stream before reading another */
export async function readTextStream(filePath, callback, 
// Below, if number is too low, Neutralino witnessed will fail NE_RT_NATRTER (hopefully its not a specific number used versus how much is available to stream in targeted file)
chunkSize = 1024 * 18) {
    return new Promise(async (res, rej) => {
        let offset = 0;
        const stats = await fs.getStats(filePath);
        const size = stats.size;
        if (chunkSize > size) {
            chunkSize = size;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV1dHJhbGluby5zdHJlYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vLnN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBbUIsQ0FBQTtBQUU5RiwrRkFBK0Y7QUFDL0YsTUFBTSxDQUFDLEtBQUssVUFBVSxjQUFjLENBQ2xDLFFBQWdCLEVBQ2hCLFFBQXdCO0FBQ3hCLCtLQUErSztBQUMvSyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUU7SUFFckIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3BDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUNkLE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN6QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBO1FBRXZCLElBQUssU0FBUyxHQUFHLElBQUksRUFBRztZQUN0QixTQUFTLEdBQUcsSUFBSSxDQUFBO1NBQ2pCO1FBRUQsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ2YsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFBO1lBQ2pELEdBQUcsQ0FBRSxTQUFTLENBQUUsQ0FBQTtZQUVoQixzREFBc0Q7WUFDdEQsTUFBTSxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFBO1lBQzdCLEtBQUssR0FBRyxLQUFLLENBQUE7WUFDYixZQUFZLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLENBQUMsQ0FBQTtRQUVELDJHQUEyRztRQUMzRyxJQUFJLFlBQVks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QixNQUFNLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBRWxELGdFQUFnRTtJQUNoRSxNQUFNLGNBQWMsR0FBRyxRQUFRLEdBQUcsV0FBVyxDQUFBO0lBQzdDLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBRTlELGtDQUFrQztJQUNsQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUU3RCwyQ0FBMkM7SUFDM0MsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU5ldXRyYWxpbm8sIElOZXV0cmFsaW5vRnMgfSBmcm9tIFwiLi9OZXV0cmFsaW5vLnV0aWxzXCJcbmltcG9ydCB7IHN0cmVhbUNhbGxiYWNrIH0gZnJvbSBcIi4vRG1GaWxlUmVhZGVyXCJcblxuZGVjbGFyZSBjb25zdCBOZXV0cmFsaW5vOiBJTmV1dHJhbGlub1xuZXhwb3J0IGNvbnN0IGZzID0gdHlwZW9mIE5ldXRyYWxpbm8gPT09ICdvYmplY3QnID8gTmV1dHJhbGluby5maWxlc3lzdGVtIDoge30gYXMgSU5ldXRyYWxpbm9Gc1xuXG4vKiogUmVhZCBhIGZpbGUgaW4gc3RyZWFtcyBhd2FpdGluZyBhIGNhbGxiYWNrIHRvIHByb2Nlc3MgZWFjaCBzdHJlYW0gYmVmb3JlIHJlYWRpbmcgYW5vdGhlciAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRUZXh0U3RyZWFtKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBjYWxsYmFjazogc3RyZWFtQ2FsbGJhY2ssXG4gIC8vIEJlbG93LCBpZiBudW1iZXIgaXMgdG9vIGxvdywgTmV1dHJhbGlubyB3aXRuZXNzZWQgd2lsbCBmYWlsIE5FX1JUX05BVFJURVIgKGhvcGVmdWxseSBpdHMgbm90IGEgc3BlY2lmaWMgbnVtYmVyIHVzZWQgdmVyc3VzIGhvdyBtdWNoIGlzIGF2YWlsYWJsZSB0byBzdHJlYW0gaW4gdGFyZ2V0ZWQgZmlsZSlcbiAgY2h1bmtTaXplID0gMTAyNCAqIDE4LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzLCByZWopID0+IHtcbiAgICBsZXQgb2Zmc2V0ID0gMFxuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMuZ2V0U3RhdHMoZmlsZVBhdGgpXG4gICAgY29uc3Qgc2l6ZSA9IHN0YXRzLnNpemVcblxuICAgIGlmICggY2h1bmtTaXplID4gc2l6ZSApIHtcbiAgICAgIGNodW5rU2l6ZSA9IHNpemVcbiAgICB9XG5cbiAgICBsZXQgY2xvc2UgPSAoKSA9PiB7XG4gICAgICBOZXV0cmFsaW5vLmV2ZW50cy5vZmYoJ29wZW5lZEZpbGUnLCBkYXRhQ2FsbGJhY2spXG4gICAgICByZXMoIHVuZGVmaW5lZCApXG4gICAgICBcbiAgICAgIC8vIHByZXZlbnQgY2FsbGluZyBjYWxsYmFja3MgdHdpY2UgYnkgcmVkZWNsYXJpbmcgdGhlbVxuICAgICAgY29uc3QgZW1wdHkgPSAoKSA9PiB1bmRlZmluZWRcbiAgICAgIGNsb3NlID0gZW1wdHlcbiAgICAgIGRhdGFDYWxsYmFjayA9IGVtcHR5XG4gICAgfVxuXG4gICAgLy8gbWFpbiBjYWxsYmFjayB1c2VkIHRvIHJlYWQgZWFjaCBzdHJlYW0gb2YgZGF0YS4gT24gY2xvc2Ugb2Ygc3RyZWFtLCBpdHMgcmUtZGVjbGFyZWQgYXMgYW4gZW1wdHkgZnVuY3Rpb25cbiAgICBsZXQgZGF0YUNhbGxiYWNrID0gKGV2dDogYW55KSA9PiB7XG4gICAgICBpZihldnQuZGV0YWlsLmlkICE9IGZpbGVJZCkge1xuICAgICAgICByZXR1cm4gLy8gdGhpcyBjYWxsIGlzIG5vdCBmb3IgdXNcbiAgICAgIH1cblxuICAgICAgc3dpdGNoKGV2dC5kZXRhaWwuYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2RhdGEnOlxuICAgICAgICAgIGNvbnN0IGlzTGFzdCA9IChvZmZzZXQgKyBjaHVua1NpemUpID49IHNpemVcbiAgICAgICAgICBjb25zdCBwZXJjZW50ID0gb2Zmc2V0IC8gc2l6ZSAqIDEwMFxuICAgICAgICAgIGNvbnN0IHN0cmluZyA9IGV2dC5kZXRhaWwuZGF0YVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBpZiBjYWxsYmFjayByZXR1cm4gcHJvbWlzZSwgd2FpdCBmb3IgaXRcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIGNhbGxiYWNrKHN0cmluZywgeyBvZmZzZXQsIGlzTGFzdCwgcGVyY2VudCB9KSApXG4gICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyBjaHVua1NpemUgLy8gaW5jcmVhc2UgZm9yIG5leHQgaXRlcmF0aW9uXG5cbiAgICAgICAgICAgICAgICAvLyBhcmUgd2UgZG9uZSBvciBzaGFsbCB3ZSB0cmlnZ2VyIHRoZSBuZXh0IHJlYWQ/XG4gICAgICAgICAgICAgICAgaXNMYXN0ID8gY2xvc2UoKSA6IHJlYWQoKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVqKGVycilcbiAgICAgICAgICAgIHJldHVybiBjbG9zZSgpIC8vIGVycm9yIHNob3VsZCBmb3JjZSBldmVyeXRoaW5nIHRvIHN0b3BcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgY2xvc2UoKSAvLyBpbmRpY2F0aW9uIG9mIGRvbmUgYnkgTmV1dHJhbGlub1xuICAgICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHVzZWQgYXQgZXZlcnkgdGltZSB3ZSBhcmUgcmVhZHkgdG8gY29udGludWUgcmVhZGluZ1xuICAgIGNvbnN0IHJlYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBubyBhd2FpdCBoZXJlIG5lZWRlZCAoZGF0YUNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkKVxuICAgICAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0udXBkYXRlT3BlbmVkRmlsZShmaWxlSWQsICdyZWFkJywgY2h1bmtTaXplKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJlaihlcnIpXG4gICAgICAgIGNsb3NlKClcbiAgICAgIH0gIFxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNhbGxiYWNrIGNhbGxpbmcgY2FsbGJhY2sgc28gaW5jYXNlIHdlIG5lZWQgdG8gcHJldmVudCBmdXJ0aGVyIGNhbGxzIHdlIGNhbiBzd2l0Y2ggb3V0IHRoZSBmaXJzdCBjYWxsYmFja1xuICAgIGNvbnN0IHJlYWxDYWxsYmFjayA9IChldnQ6IGFueSkgPT4gZGF0YUNhbGxiYWNrKGV2dClcblxuICAgIC8vIHN0YXJ0IHRoZSBhY3R1YWwgcHJvY2Vzc2luZ1xuICAgIE5ldXRyYWxpbm8uZXZlbnRzLm9uKCdvcGVuZWRGaWxlJywgcmVhbENhbGxiYWNrKVxuICAgIGNvbnN0IGZpbGVJZCA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5vcGVuRmlsZSggZmlsZVBhdGggKVxuICAgIHJlYWQoKVxuICB9KVxufSAgXG5cbi8qKiBSZWFkIGEgZmlsZSBpbiBzdHJlYW1zIGF3YWl0aW5nIGEgY2FsbGJhY2sgdG8gcHJvdmlkZSBhIHN0cmluZyB0byB3cml0ZSBhcyBuZXcgY29udGVudCBmb3IgdGhlIG9yaWdpbmFsIHJlYWQgZmlsZVxuICogMS4gQSBibGFuayBmaWxlIGlzIGNyZWF0ZWRcbiAqIDIuIE9yaWdpbmFsIGZpbGUgaXMgcmVhZCBpbiBzdHJlYW1zXG4gKiAzLiBSZXN1bHQgZnJvbSBjYWxsYmFjayBpcyBhcHBlbmRlZCB0byB0aGUgZmlsZSBpbiBzdGVwIDFcbiAqIDQuIFdoZW4gYWxsIG9mIGZpbGUgaXMgcmVhZCB3ZSByZW5hbWUgdGhlIG9yaWdpbmFsIGZpbGVcbiAqIDUuIFRoZSBmaWxlIHdlIGFwcGVuZCBhbGwgcmVzdWx0cyB0bywgaXMgcmVuYW1lZCB0byB0aGUgb3JpZ2luYWwgZmlsZXMgbmFtZVxuICogNi4gVGhlIG9yaWdpbmFsIGZpbGUsIHRoYXQgd2FzIHJlbmFtZWQsIGlzIG5vdyBkZWxldGVkXG4gKiAtIEFsbCBvZiB0aGUgYWJvdmUgbXVzdCBiZSBwZXJmb3JtZWQgYXMgTmV1dHJhbGlubyBkb2VzIG5vdCBzdXBwb3J0IHN0cmVhbSB3cml0aW5nIGxpa2UgdGhlIGJyb3dzZXIgZG9lc1xuKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkV3JpdGVGaWxlKFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBjYWxsYmFjazogc3RyZWFtQ2FsbGJhY2ssXG4gIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDE4IC8vIFRvbyBsb3cgYSBudW1iZXIsIGNhbiBlcnJvci4gTW9yZSBkZXRhaWxzIGluIGZpbGUgc2VhcmNoIGZvciBcImNodW5rU2l6ZVwiIGluIHRoaXMgZmlsZVxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGNsb25lRnVsbFBhdGggPSBmaWxlUGF0aCArICcud3JpdGluZydcblxuICAvLyBjcmVhdGUgYW4gZW1wdHkgZmlsZSB3ZSB3aWxsIHN0cmVhbSByZXN1bHRzIGludG9cbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLndyaXRlRmlsZShjbG9uZUZ1bGxQYXRoLCAnJylcblxuICAvLyBjcmVhdGUgY2FsbGJhY2sgdGhhdCB3aWxsIGhhbmRsZSBlYWNoIHBhcnQgb2YgdGhlIHN0cmVhbVxuICBjb25zdCBtaWR3YXJlOiBzdHJlYW1DYWxsYmFjayA9IChzdHJpbmcsIHN0YXRzKSA9PiB7XG4gICAgY29uc3QgbmV3U3RyaW5nID0gY2FsbGJhY2soc3RyaW5nLCBzdGF0cylcbiAgICBcbiAgICAvLyBubyBhd2FpdFxuICAgIHJldHVybiBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uYXBwZW5kRmlsZShjbG9uZUZ1bGxQYXRoLCBuZXdTdHJpbmcpXG4gIH1cblxuICAvLyBzdHJlYW0gdGhlIGVudGlyZSBmaWxlXG4gIGF3YWl0IHJlYWRUZXh0U3RyZWFtKGZpbGVQYXRoLCBtaWR3YXJlLCBjaHVua1NpemUpXG5cbiAgLy8gcmVuYW1lIG9yaWdpbmFsIGZpbGUganVzdCBpbmNhc2UgYW55IGlzc3VlcyB3aXRoIG5leHQgc3RlcChzKVxuICBjb25zdCByZW5hbWVGdWxsUGF0aCA9IGZpbGVQYXRoICsgJy5vcmlnaW5hbCdcbiAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLm1vdmVGaWxlKGZpbGVQYXRoLCByZW5hbWVGdWxsUGF0aClcblxuICAvLyByZW5hbWUgdGhlIGZpbGUgd2Ugc3RyZWFtIHdyb3RlXG4gIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5tb3ZlRmlsZShjbG9uZUZ1bGxQYXRoLCBmaWxlUGF0aClcblxuICAvLyBkZWxldGUgb3JpZ2luYWwgZmlsZSBiZWNhdXNlIHdlIGFyZSBkb25lXG4gIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZW1vdmVGaWxlKHJlbmFtZUZ1bGxQYXRoKVxufSJdfQ==