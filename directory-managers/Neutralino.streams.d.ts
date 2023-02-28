import { INeutralinoFs } from "./Neutralino.utils";
import { streamCallback } from "./DmFileReader";
export declare const fs: INeutralinoFs;
/** Read a file in streams awaiting a callback to process each stream before reading another */
export declare function readTextStream(filePath: string, callback: streamCallback, chunkSize?: number): Promise<void>;
/** Read a file in streams awaiting a callback to provide a string to write as new content for the original read file
 * 1. A blank file is created
 * 2. Original file is read in streams
 * 3. Result from callback is appended to the file in step 1
 * 4. When all of file is read we rename the original file
 * 5. The file we append all results to, is renamed to the original files name
 * 6. The original file, that was renamed, is now deleted
 * - All of the above must be performed as Neutralino does not support stream writing like the browser does
*/
export declare function readWriteFile(filePath: string, callback: streamCallback, chunkSize?: number): Promise<void>;
