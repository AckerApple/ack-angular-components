/**  This function reads a file from the user's file system and returns an Observable that emits slices of the file */
export function readFileStream(file, chunkSize = 1024 * 1024, // 1MB,
eachString = (string) => undefined, { awaitEach = false } = {}) {
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
        /** onload means when data loaded not just the first time */
        reader.onload = async (event) => {
            if (event.target?.result) {
                const promise = eachString(event.target.result, {
                    isLast: (offset + chunkSize) >= fileSize,
                    percent: offset / fileSize * 100,
                    offset,
                    stop,
                    cancel
                });
                if (awaitEach) {
                    await promise;
                }
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
export async function readWriteFile(file, fileHandle, transformFn, // aka callback
chunkSize = 1024 * 1024, // 1 MB
options) {
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
    await file.readTextStream(onString, chunkSize, options);
    await writableStream.close();
    writableStream.truncate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZEZpbGVTdHJlYW0uZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0b3J5LW1hbmFnZXJzL3JlYWRGaWxlU3RyZWFtLmZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLHNIQUFzSDtBQUN0SCxNQUFNLFVBQVUsY0FBYyxDQUM1QixJQUFVLEVBQ1YsWUFBb0IsSUFBSSxHQUFHLElBQUksRUFBRSxPQUFPO0FBQ3hDLGFBQTZCLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQzFELEVBQUMsU0FBUyxHQUFDLEtBQUssS0FBbUIsRUFBRTtJQUVyQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQzFCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQTtJQUVuQixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7UUFFL0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ2hCLE9BQU8sR0FBRyxJQUFJLENBQUE7WUFDZCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDaEIsQ0FBQyxDQUFBO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFBO1FBRW5CLDREQUE0RDtRQUM1RCxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUM5QixJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO2dCQUN4QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQ3hCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBZ0IsRUFBRTtvQkFDN0IsTUFBTSxFQUFFLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLFFBQVE7b0JBQ3hDLE9BQU8sRUFBRSxNQUFNLEdBQUcsUUFBUSxHQUFHLEdBQUc7b0JBQ2hDLE1BQU07b0JBQ04sSUFBSTtvQkFDSixNQUFNO2lCQUNQLENBQ0YsQ0FBQTtnQkFFRCxJQUFLLFNBQVMsRUFBRztvQkFDZixNQUFNLE9BQU8sQ0FBQTtpQkFDZDtnQkFFRCxZQUFZO2dCQUNaLE1BQU0sSUFBSSxTQUFTLENBQUE7YUFDcEI7WUFFRCxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sR0FBRyxRQUFRLEVBQUU7Z0JBQ2pDLFNBQVMsRUFBRSxDQUFBO2FBQ1o7aUJBQU07Z0JBQ0wsR0FBRyxFQUFFLENBQUE7YUFDTjtRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFBO1FBRXBCLFNBQVMsU0FBUztZQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUE7WUFDcEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQixDQUFDO1FBRUQsU0FBUyxFQUFFLENBQUE7UUFDWCw4QkFBOEI7SUFDaEMsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBR0QsTUFBTSxDQUFDLEtBQUssVUFBVSxhQUFhLENBQ2pDLElBQWtCLEVBQ2xCLFVBQWdDLEVBQ2hDLFdBR1csRUFBRSxlQUFlO0FBQzVCLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLE9BQU87QUFDaEMsT0FBdUI7SUFFdkIsTUFBTSxjQUFjLEdBQUcsTUFBTSxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUEsQ0FBQyxzQ0FBc0M7SUFDL0YsTUFBTSxRQUFRLEdBQW1CLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdkQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQTtRQUMvQixLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUNoQixZQUFZLEVBQUUsQ0FBQSxDQUFDLGdDQUFnQztZQUMvQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDeEIsQ0FBQyxDQUFBO1FBQ0QsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDbEIsWUFBWSxFQUFFLENBQUEsQ0FBQyxnQ0FBZ0M7WUFDL0MsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3hCLENBQUMsQ0FBQTtRQUVELE9BQU8sY0FBYyxDQUFDLEtBQUssQ0FDekIsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUNqQyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDdkQsTUFBTSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDNUIsY0FBYyxDQUFDLFFBQVEsQ0FBQTtBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRG1GaWxlUmVhZGVyLCBzdHJlYW1DYWxsYmFjaywgU3RyZWFtT3B0aW9ucywgU3RyZWFtU3RhdHMgfSBmcm9tIFwiLi9EbUZpbGVSZWFkZXJcIlxuXG4vKiogIFRoaXMgZnVuY3Rpb24gcmVhZHMgYSBmaWxlIGZyb20gdGhlIHVzZXIncyBmaWxlIHN5c3RlbSBhbmQgcmV0dXJucyBhbiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgc2xpY2VzIG9mIHRoZSBmaWxlICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVTdHJlYW0oXG4gIGZpbGU6IEZpbGUsXG4gIGNodW5rU2l6ZTogbnVtYmVyID0gMTAyNCAqIDEwMjQsIC8vIDFNQixcbiAgZWFjaFN0cmluZzogc3RyZWFtQ2FsbGJhY2sgPSAoc3RyaW5nOiBzdHJpbmcpID0+IHVuZGVmaW5lZCxcbiAge2F3YWl0RWFjaD1mYWxzZX06IFN0cmVhbU9wdGlvbnMgPSB7fVxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGZpbGVTaXplID0gZmlsZS5zaXplXG4gIGxldCBvZmZzZXQgPSAwXG4gIGxldCBzdG9wcGVkID0gZmFsc2VcblxuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlcywgcmVqKSA9PiB7XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuXG4gICAgY29uc3Qgc3RvcCA9ICgpID0+IHtcbiAgICAgIHN0b3BwZWQgPSB0cnVlXG4gICAgICByZWFkZXIuYWJvcnQoKVxuICAgIH1cbiAgICBjb25zdCBjYW5jZWwgPSBzdG9wXG4gIFxuICAgIC8qKiBvbmxvYWQgbWVhbnMgd2hlbiBkYXRhIGxvYWRlZCBub3QganVzdCB0aGUgZmlyc3QgdGltZSAqL1xuICAgIHJlYWRlci5vbmxvYWQgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQ/LnJlc3VsdCkgeyAgICAgICAgXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBlYWNoU3RyaW5nKFxuICAgICAgICAgIGV2ZW50LnRhcmdldC5yZXN1bHQgYXMgc3RyaW5nLCB7XG4gICAgICAgICAgICBpc0xhc3Q6IChvZmZzZXQgKyBjaHVua1NpemUpID49IGZpbGVTaXplLFxuICAgICAgICAgICAgcGVyY2VudDogb2Zmc2V0IC8gZmlsZVNpemUgKiAxMDAsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBzdG9wLFxuICAgICAgICAgICAgY2FuY2VsXG4gICAgICAgICAgfVxuICAgICAgICApXG5cbiAgICAgICAgaWYgKCBhd2FpdEVhY2ggKSB7XG4gICAgICAgICAgYXdhaXQgcHJvbWlzZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBpbmNyZW1lbnRcbiAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZVxuICAgICAgfVxuXG4gICAgICBpZiAoIXN0b3BwZWQgJiYgb2Zmc2V0IDwgZmlsZVNpemUpIHtcbiAgICAgICAgcmVhZFNsaWNlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVhZGVyLm9uZXJyb3IgPSByZWpcblxuICAgIGZ1bmN0aW9uIHJlYWRTbGljZSgpIHtcbiAgICAgIGNvbnN0IHNsaWNlID0gZmlsZS5zbGljZShvZmZzZXQsIG9mZnNldCArIGNodW5rU2l6ZSlcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KHNsaWNlKVxuICAgIH1cblxuICAgIHJlYWRTbGljZSgpXG4gICAgLy8gcmV0dXJuICgpID0+IHJlYWRlci5hYm9ydCgpXG4gIH0pXG59XG5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRXcml0ZUZpbGUoXG4gIGZpbGU6IERtRmlsZVJlYWRlcixcbiAgZmlsZUhhbmRsZTogRmlsZVN5c3RlbUZpbGVIYW5kbGUsXG4gIHRyYW5zZm9ybUZuOiAoXG4gICAgY2h1bms6IHN0cmluZyxcbiAgICBzdGF0czogU3RyZWFtU3RhdHNcbiAgKSA9PiBzdHJpbmcsIC8vIGFrYSBjYWxsYmFja1xuICBjaHVua1NpemUgPSAxMDI0ICogMTAyNCwgLy8gMSBNQlxuICBvcHRpb25zPzogU3RyZWFtT3B0aW9uc1xuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHdyaXRhYmxlU3RyZWFtID0gYXdhaXQgZmlsZUhhbmRsZS5jcmVhdGVXcml0YWJsZSgpIC8vIE9wZW4gYSB3cml0YWJsZSBzdHJlYW0gZm9yIHRoZSBmaWxlXG4gIGNvbnN0IG9uU3RyaW5nOiBzdHJlYW1DYWxsYmFjayA9IGFzeW5jIChzdHJpbmcsIHN0YXRzKSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luYWxTdG9wID0gc3RhdHMuc3RvcFxuICAgIHN0YXRzLnN0b3AgPSAoKSA9PiB7XG4gICAgICBvcmlnaW5hbFN0b3AoKSAvLyBjYWxsIHRoZSBzdG9wIHdlIGFyZSB3cmFwcGluZ1xuICAgICAgd3JpdGFibGVTdHJlYW0uY2xvc2UoKVxuICAgIH1cbiAgICBzdGF0cy5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICBvcmlnaW5hbFN0b3AoKSAvLyBjYWxsIHRoZSBzdG9wIHdlIGFyZSB3cmFwcGluZ1xuICAgICAgd3JpdGFibGVTdHJlYW0uYWJvcnQoKVxuICAgIH1cbiAgICAgICAgXG4gICAgcmV0dXJuIHdyaXRhYmxlU3RyZWFtLndyaXRlKFxuICAgICAgYXdhaXQgdHJhbnNmb3JtRm4oc3RyaW5nLCBzdGF0cylcbiAgICApXG4gIH1cbiAgXG4gIGF3YWl0IGZpbGUucmVhZFRleHRTdHJlYW0ob25TdHJpbmcsIGNodW5rU2l6ZSwgb3B0aW9ucylcbiAgYXdhaXQgd3JpdGFibGVTdHJlYW0uY2xvc2UoKVxuICB3cml0YWJsZVN0cmVhbS50cnVuY2F0ZVxufVxuIl19