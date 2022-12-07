import { EventEmitter } from '@angular/core';
import { DirectoryManager } from '../../directory-managers/DirectoryManagers';
import * as i0 from "@angular/core";
export declare class RobustSelectDirectoryComponent {
    label: string;
    pickerId?: string;
    reloadPath?: string;
    error: EventEmitter<Error>;
    directoryManager?: DirectoryManager;
    directoryManagerChange: EventEmitter<DirectoryManager>;
    getPickerId(): string;
    onPathReload(path: string): Promise<void>;
    selectPath(): Promise<void>;
    getId(): string;
    showDirectoryPicker(): void;
    readInputDirectory(input: any): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<RobustSelectDirectoryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RobustSelectDirectoryComponent, "robust-select-directory", never, { "label": "label"; "pickerId": "pickerId"; "reloadPath": "reloadPath"; "directoryManager": "directoryManager"; }, { "error": "error"; "directoryManagerChange": "directoryManagerChange"; }, never, never, false>;
}
