import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BrowserDirectoryManager } from '../../directory-managers/BrowserDirectoryManagers';
import { directoryReadToArray } from '../../directory-managers/directoryReadToArray.function';
import { NeutralinoDirectoryManager } from '../../directory-managers/NeutralinoDirectoryManager';
import { SafariDirectoryManager } from '../../directory-managers/SafariDirectoryManagers';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class RobustSelectDirectoryComponent {
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
RobustSelectDirectoryComponent.??fac = i0.????ngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, deps: [], target: i0.????FactoryTarget.Component });
RobustSelectDirectoryComponent.??cmp = i0.????ngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<!-- search hints: reselect -->\n\n<input class=\"invisible pos-abs\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.????ngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUUzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQTtBQUM3RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTs7O0FBUXpGLE1BQU0sT0FBTyw4QkFBOEI7SUFKM0M7UUFRWSxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVMsQ0FBQTtRQUVqQywyQkFBc0IsR0FBRyxJQUFJLFlBQVksRUFBb0IsQ0FBQTtLQXNFeEU7SUFwRUMsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxFQUFFLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZO1FBQzdCLElBQUssT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFHO1lBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDL0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUE7U0FDN0Q7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLEtBQUssR0FBRyxPQUFPLFVBQVUsS0FBSyxRQUFRLENBQUE7UUFDNUMsSUFBSyxLQUFLLEVBQUc7WUFDWCxJQUFJLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtZQUNyRCxJQUFLLFFBQVEsRUFBRztnQkFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQTtnQkFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDbkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUE7YUFDN0Q7WUFDRCxPQUFNO1NBQ1A7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsbUJBQTBCLENBQUE7UUFFcEQsU0FBUztRQUNULElBQUssVUFBVSxFQUFHO1lBQ2hCLElBQUk7Z0JBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUM7b0JBQzlDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUN0QixvQkFBb0I7b0JBQ3BCLElBQUksRUFBRSxXQUFXO2lCQUNsQixDQUFDLENBQUE7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxvQkFBb0IsQ0FBRSxNQUFNLENBQUUsQ0FBQTtnQkFDckQsTUFBTSxFQUFFLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO2dCQUM1RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQTtnQkFDNUQsT0FBTTthQUNQO1lBQUMsT0FBTyxHQUFRLEVBQUU7Z0JBQ2pCLElBQUssR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUc7b0JBQ3JDLE9BQU07aUJBQ1A7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDckI7U0FDRjtRQUVELFNBQVM7UUFDVCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtJQUM1QixDQUFDO0lBRUQsS0FBSztRQUNILE9BQU8scUJBQXFCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUMzQyxDQUFDO0lBRUQsbUJBQW1CO1FBQ2pCLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUE7SUFDaEQsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBVTtRQUNqQyxJQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRztZQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUE7WUFDOUQsT0FBTSxDQUFDLG9CQUFvQjtTQUM1QjtRQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFXLENBQUE7UUFDcEgsTUFBTSxFQUFFLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDOUQsQ0FBQzs7MkhBM0VVLDhCQUE4QjsrR0FBOUIsOEJBQThCLGdRQ2IzQyw0dUJBcUJBOzJGRFJhLDhCQUE4QjtrQkFKMUMsU0FBUzsrQkFDRSx5QkFBeUI7OEJBSTFCLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0ksS0FBSztzQkFBZCxNQUFNO2dCQUNFLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFDSSxzQkFBc0I7c0JBQS9CLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXG5pbXBvcnQgeyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMnXG5pbXBvcnQgeyBEaXJlY3RvcnlNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vZGlyZWN0b3J5LW1hbmFnZXJzL0RpcmVjdG9yeU1hbmFnZXJzJ1xuaW1wb3J0IHsgZGlyZWN0b3J5UmVhZFRvQXJyYXkgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvZGlyZWN0b3J5UmVhZFRvQXJyYXkuZnVuY3Rpb24nXG5pbXBvcnQgeyBOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlciB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlcidcbmltcG9ydCB7IFNhZmFyaURpcmVjdG9yeU1hbmFnZXIgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvU2FmYXJpRGlyZWN0b3J5TWFuYWdlcnMnXG5cbmRlY2xhcmUgY29uc3QgTmV1dHJhbGlubzogYW55XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgUm9idXN0U2VsZWN0RGlyZWN0b3J5Q29tcG9uZW50IHtcbiAgQElucHV0KCkgbGFiZWwhOiBzdHJpbmcgLy8gXCJMYXVuY2hCb3hcIlxuICBASW5wdXQoKSBwaWNrZXJJZD86IHN0cmluZyAvLyBlbnN1cmVzIGxvYWRlZCBwYXRoIGlzIHNhbWUgYXMgcHJldmlvdXNcbiAgQElucHV0KCkgcmVsb2FkUGF0aD86IHN0cmluZyAvLyBDOlxcYmxhaFxcYmxhaFxuICBAT3V0cHV0KCkgZXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpXG4gIEBJbnB1dCgpIGRpcmVjdG9yeU1hbmFnZXI/OiBEaXJlY3RvcnlNYW5hZ2VyXG4gIEBPdXRwdXQoKSBkaXJlY3RvcnlNYW5hZ2VyQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEaXJlY3RvcnlNYW5hZ2VyPigpXG5cbiAgZ2V0UGlja2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGlja2VySWQgfHwgdGhpcy5nZXRJZCgpLnJlcGxhY2UoL1sgLV9dL2csJycpXG4gIH1cbiAgXG4gIGFzeW5jIG9uUGF0aFJlbG9hZChwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoIHR5cGVvZiBOZXV0cmFsaW5vID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGNvbnN0IGRtID0gbmV3IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyKHBhdGgpXG4gICAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgICB9XG4gIH1cblxuICBhc3luYyBzZWxlY3RQYXRoKCkge1xuICAgIGNvbnN0IGlzTmV1ID0gdHlwZW9mIE5ldXRyYWxpbm8gPT09ICdvYmplY3QnXG4gICAgaWYgKCBpc05ldSApIHtcbiAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IE5ldXRyYWxpbm8ub3Muc2hvd0ZvbGRlckRpYWxvZygpXG4gICAgICBpZiAoIHJlc3BvbnNlICkge1xuICAgICAgICB0aGlzLnJlbG9hZFBhdGggPSByZXNwb25zZVxuICAgICAgICBjb25zdCBkbSA9IG5ldyBOZXV0cmFsaW5vRGlyZWN0b3J5TWFuYWdlcihyZXNwb25zZSlcbiAgICAgICAgdGhpcy5kaXJlY3RvcnlNYW5hZ2VyQ2hhbmdlLmVtaXQodGhpcy5kaXJlY3RvcnlNYW5hZ2VyID0gZG0pXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBjYW5QaWNrRGlyID0gd2luZG93LnNob3dEaXJlY3RvcnlQaWNrZXIgYXMgYW55XG5cbiAgICAvLyBjaHJvbWVcbiAgICBpZiAoIGNhblBpY2tEaXIgKSB7ICBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJveERpciA9IGF3YWl0IHdpbmRvdy5zaG93RGlyZWN0b3J5UGlja2VyKHtcbiAgICAgICAgICBpZDogdGhpcy5nZXRQaWNrZXJJZCgpLFxuICAgICAgICAgIC8vIGlkOiB0aGlzLmdldElkKCksXG4gICAgICAgICAgbW9kZTogJ3JlYWR3cml0ZSdcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgYm94RmlsZXMgPSBhd2FpdCBkaXJlY3RvcnlSZWFkVG9BcnJheSggYm94RGlyIClcbiAgICAgICAgY29uc3QgZG0gPSBuZXcgQnJvd3NlckRpcmVjdG9yeU1hbmFnZXIoJycsIGJveEZpbGVzLCBib3hEaXIpXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5TWFuYWdlckNoYW5nZS5lbWl0KHRoaXMuZGlyZWN0b3J5TWFuYWdlciA9IGRtKVxuICAgICAgICByZXR1cm5cbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIGlmICggZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ2Fib3J0ZWQnKSApIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVycm9yLmVtaXQoZXJyKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNhZmFyaVxuICAgIHRoaXMuc2hvd0RpcmVjdG9yeVBpY2tlcigpXG4gIH1cblxuICBnZXRJZCgpIHtcbiAgICByZXR1cm4gJ3JvYnVzdEZvbGRlclBpY2tlci0nICsgdGhpcy5sYWJlbFxuICB9XG5cbiAgc2hvd0RpcmVjdG9yeVBpY2tlcigpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmdldElkKCkpPy5jbGljaygpXG4gIH1cblxuICAvLyBzYWZhcmkgcmVhZCBkaXJlY3RvcnlcbiAgYXN5bmMgcmVhZElucHV0RGlyZWN0b3J5KGlucHV0OiBhbnkpIHtcbiAgICBpZiAoICFpbnB1dC5maWxlcyApIHtcbiAgICAgIHRoaXMuZXJyb3IuZW1pdChuZXcgRXJyb3IoJ25vIGRpcmVjdG9yeSB3aXRoIGZpbGVzIHNlbGVjdGVkJykpXG4gICAgICByZXR1cm4gLy8gbm8gZmlsZXMgc2VsZWN0ZWRcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5lbnRyaWVzKGlucHV0LmZpbGVzKS5maWx0ZXIoKFtrZXldKSA9PiBrZXkgIT0gJ2xlbmd0aCcpLm1hcCgoW19rZXksIHZhbHVlXSkgPT4gdmFsdWUpIGFzIEZpbGVbXVxuICAgIGNvbnN0IGRtID0gbmV3IFNhZmFyaURpcmVjdG9yeU1hbmFnZXIoJycsIGZpbGVzKVxuICAgIHRoaXMuZGlyZWN0b3J5TWFuYWdlckNoYW5nZS5lbWl0KHRoaXMuZGlyZWN0b3J5TWFuYWdlciA9IGRtKVxuICB9XG59XG4iLCI8IS0tIHNlYXJjaCBoaW50czogcmVzZWxlY3QgLS0+XG5cbjxpbnB1dCBjbGFzcz1cImludmlzaWJsZSBwb3MtYWJzXCIgdHlwZT1cImZpbGVcIiBkaXJlY3RvcnkgYWNjZXB0PVwiLmZvbGRlclwiIHdlYmtpdGRpcmVjdG9yeVxuICBbaWRdPVwiJ3JvYnVzdEZvbGRlclBpY2tlci0nICsgbGFiZWxcIlxuICBbbmFtZV09XCIncm9idXN0Rm9sZGVyUGlja2VyLScgKyBsYWJlbFwiXG4gIChjaGFuZ2UpPVwicmVhZElucHV0RGlyZWN0b3J5KCRldmVudC50YXJnZXQpXCJcbi8+XG5cbjxidXR0b24gKm5nSWY9XCJyZWxvYWRQYXRoXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleDFcIlxuICBbdGl0bGVdID0gXCJyZWxvYWRQYXRoXCJcbiAgKGNsaWNrKSA9IFwib25QYXRoUmVsb2FkKHJlbG9hZFBhdGgpXCJcbj7wn5SEIFJlbG9hZDwvYnV0dG9uPlxuXG48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgxXCJcbiAgKGNsaWNrKT1cInNlbGVjdFBhdGgoKVwiXG4gIFtjbGFzcy5vcGFjaXR5LTgwXSA9IFwiZGlyZWN0b3J5TWFuYWdlclwiXG4+8J+TgSB7eyBkaXJlY3RvcnlNYW5hZ2VyID8gJ3JlJyA6ICcnIH19c2VsZWN0IHt7IGxhYmVsIH19IGZvbGRlcjwvYnV0dG9uPlxuXG48ZGl2ICpuZ0lmPVwicmVsb2FkUGF0aFwiIGNsYXNzPVwidGV4dC14c1wiPlxuICA8c3Ryb25nPnt7IGxhYmVsIH19IHBhdGg6PC9zdHJvbmc+IHt7IHJlbG9hZFBhdGggfX1cbjwvZGl2PlxuIl19