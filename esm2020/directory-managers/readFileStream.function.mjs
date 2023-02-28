/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file
 * TODO: Needs an abort
*/
export function readFileStream(file, chunkSize = 1024 * 1024, // 1MB,
eachString = (string) => undefined) {
    const fileSize = file.size;
    let offset = 0;
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const string = event.target.result;
                const isLast = (offset + chunkSize) >= fileSize;
                const percent = offset / fileSize * 100;
                eachString(string, { isLast, percent, offset });
                // increment
                offset += chunkSize;
            }
            if (offset < fileSize) {
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
export async function readWriteFile(file, fileHandle, transformFn, chunkSize = 1024 * 1024) {
    const writableStream = await fileHandle.createWritable(); // Open a writable stream for the file
    const onString = async (string, { isLast, percent, offset }) => {
        const newString = await transformFn(string, {
            isLast, percent, offset,
        });
        const result = {
            string: newString, offset,
        };
        return writableStream.write(result.string);
    };
    await file.readTextStream(onString, chunkSize);
    await writableStream.close();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZEZpbGVTdHJlYW0uZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL3JlYWRGaWxlU3RyZWFtLmZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOztFQUVFO0FBQ0YsTUFBTSxVQUFVLGNBQWMsQ0FDNUIsSUFBVSxFQUNWLFlBQW9CLElBQUksR0FBRyxJQUFJLEVBQUUsT0FBTztBQUN4QyxhQUE2QixDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsU0FBUztJQUUxRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQzFCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUVkLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUUvQixNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDeEIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtnQkFDeEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFnQixDQUFBO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUE7Z0JBQy9DLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFBO2dCQUV2QyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFBO2dCQUU3QyxZQUFZO2dCQUNaLE1BQU0sSUFBSSxTQUFTLENBQUE7YUFDcEI7WUFFRCxJQUFJLE1BQU0sR0FBRyxRQUFRLEVBQUU7Z0JBQ3JCLFNBQVMsRUFBRSxDQUFBO2FBQ1o7aUJBQU07Z0JBQ0wsR0FBRyxFQUFFLENBQUE7YUFDTjtRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFBO1FBRXBCLFNBQVMsU0FBUztZQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUE7WUFDcEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQixDQUFDO1FBRUQsU0FBUyxFQUFFLENBQUE7UUFDWCw4QkFBOEI7SUFDaEMsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBR0QsTUFBTSxDQUFDLEtBQUssVUFBVSxhQUFhLENBQ2pDLElBQWtCLEVBQ2xCLFVBQWdDLEVBQ2hDLFdBQTBELEVBQzFELFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSTtJQUV2QixNQUFNLGNBQWMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQSxDQUFDLHNDQUFzQztJQUUvRixNQUFNLFFBQVEsR0FBbUIsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRTtRQUMzRSxNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDMUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNO1NBQ3hCLENBQUMsQ0FBQTtRQUVGLE1BQU0sTUFBTSxHQUFHO1lBQ2IsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNO1NBQzFCLENBQUE7UUFFRCxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQTtJQUVELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDOUMsTUFBTSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERtRmlsZVJlYWRlciwgc3RyZWFtQ2FsbGJhY2ssIFN0cmVhbVN0YXRzIH0gZnJvbSBcIi4vRG1GaWxlUmVhZGVyXCJcblxuLyoqICBUaGlzIGZ1bmN0aW9uIHJlYWRzIGEgZmlsZSBmcm9tIHRoZSB1c2VyJ3MgZmlsZSBzeXN0ZW0gYW5kIHJldHVybnMgYW4gT2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHNsaWNlcyBvZiB0aGUgZmlsZVxuICogVE9ETzogTmVlZHMgYW4gYWJvcnRcbiovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVTdHJlYW0oXG4gIGZpbGU6IEZpbGUsXG4gIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQsIC8vIDFNQixcbiAgZWFjaFN0cmluZzogc3RyZWFtQ2FsbGJhY2sgPSAoc3RyaW5nOiBzdHJpbmcpID0+IHVuZGVmaW5lZFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGZpbGVTaXplID0gZmlsZS5zaXplXG4gIGxldCBvZmZzZXQgPSAwXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXMsIHJlaikgPT4ge1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcblxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQ/LnJlc3VsdCkge1xuICAgICAgICBjb25zdCBzdHJpbmcgPSBldmVudC50YXJnZXQucmVzdWx0IGFzIHN0cmluZ1xuICAgICAgICBjb25zdCBpc0xhc3QgPSAob2Zmc2V0ICsgY2h1bmtTaXplKSA+PSBmaWxlU2l6ZVxuICAgICAgICBjb25zdCBwZXJjZW50ID0gb2Zmc2V0IC8gZmlsZVNpemUgKiAxMDBcbiAgICAgICAgXG4gICAgICAgIGVhY2hTdHJpbmcoc3RyaW5nLCB7aXNMYXN0LCBwZXJjZW50LCBvZmZzZXR9KVxuICAgICAgICBcbiAgICAgICAgLy8gaW5jcmVtZW50XG4gICAgICAgIG9mZnNldCArPSBjaHVua1NpemVcbiAgICAgIH1cblxuICAgICAgaWYgKG9mZnNldCA8IGZpbGVTaXplKSB7XG4gICAgICAgIHJlYWRTbGljZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRlci5vbmVycm9yID0gcmVqXG5cbiAgICBmdW5jdGlvbiByZWFkU2xpY2UoKSB7XG4gICAgICBjb25zdCBzbGljZSA9IGZpbGUuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBjaHVua1NpemUpXG4gICAgICByZWFkZXIucmVhZEFzVGV4dChzbGljZSlcbiAgICB9XG5cbiAgICByZWFkU2xpY2UoKVxuICAgIC8vIHJldHVybiAoKSA9PiByZWFkZXIuYWJvcnQoKVxuICB9KVxufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkV3JpdGVGaWxlKFxuICBmaWxlOiBEbUZpbGVSZWFkZXIsXG4gIGZpbGVIYW5kbGU6IEZpbGVTeXN0ZW1GaWxlSGFuZGxlLFxuICB0cmFuc2Zvcm1GbjogKGNodW5rOiBzdHJpbmcsIHN0YXRzOiBTdHJlYW1TdGF0cykgPT4gc3RyaW5nLFxuICBjaHVua1NpemUgPSAxMDI0ICogMTAyNCwgLy8gMSBNQlxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHdyaXRhYmxlU3RyZWFtID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpIC8vIE9wZW4gYSB3cml0YWJsZSBzdHJlYW0gZm9yIHRoZSBmaWxlXG4gIFxuICBjb25zdCBvblN0cmluZzogc3RyZWFtQ2FsbGJhY2sgPSBhc3luYyAoc3RyaW5nLCB7aXNMYXN0LCBwZXJjZW50LCBvZmZzZXR9KSA9PiB7XG4gICAgY29uc3QgbmV3U3RyaW5nID0gYXdhaXQgdHJhbnNmb3JtRm4oc3RyaW5nLCB7XG4gICAgICBpc0xhc3QsIHBlcmNlbnQsIG9mZnNldCxcbiAgICB9KVxuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgc3RyaW5nOiBuZXdTdHJpbmcsIG9mZnNldCxcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHdyaXRhYmxlU3RyZWFtLndyaXRlKHJlc3VsdC5zdHJpbmcpXG4gIH1cbiAgXG4gIGF3YWl0IGZpbGUucmVhZFRleHRTdHJlYW0ob25TdHJpbmcsIGNodW5rU2l6ZSlcbiAgYXdhaXQgd3JpdGFibGVTdHJlYW0uY2xvc2UoKVxufVxuIl19