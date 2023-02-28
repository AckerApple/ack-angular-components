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
        }
        throw new Error('Cannot find supporting functionality to display a directory picker');
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
RobustSelectDirectoryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<!-- search hints: reselect -->\n\n<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'robust-select-directory', template: "<!-- search hints: reselect -->\n\n<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n" }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUUzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQTtBQUU3RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTs7O0FBUXpGLE1BQU0sT0FBTyw4QkFBOEI7SUFKM0M7UUFRWSxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVMsQ0FBQTtRQUVqQywyQkFBc0IsR0FBRyxJQUFJLFlBQVksRUFBb0IsQ0FBQTtLQW9GeEU7SUFsRkMsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxFQUFFLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZO1FBQzdCLElBQUssT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFHO1lBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDL0MsSUFBSSxDQUFD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QUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFXLENBQUE7UUFDcEgsTUFBTSxFQUFFLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDOUQsQ0FBQzs7MkhBekZVLDhCQUE4QjsrR0FBOUIsOEJBQThCLGdRQ2QzQyxpdUJBcUJBOzJGRFBhLDhCQUE4QjtrQkFKMUMsU0FBUzsrQkFDRSx5QkFBeUI7OEJBSTFCLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0ksS0FBSztzQkFBZCxNQUFNO2dCQUNFLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFDSSxzQkFBc0I7c0JBQS9CLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXG5pbXBvcnQgeyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMnXG5pbXBvcnQgeyBEaXJlY3RvcnlNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vZGlyZWN0b3J5LW1hbmFnZXJzL0RpcmVjdG9yeU1hbmFnZXJzJ1xuaW1wb3J0IHsgZGlyZWN0b3J5UmVhZFRvQXJyYXkgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvZGlyZWN0b3J5UmVhZFRvQXJyYXkuZnVuY3Rpb24nXG5pbXBvcnQgeyBGb2xkZXJEaWFsb2dPcHRpb25zLCBJTmV1dHJhbGlubyB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vLnV0aWxzJ1xuaW1wb3J0IHsgTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXInXG5pbXBvcnQgeyBTYWZhcmlEaXJlY3RvcnlNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vZGlyZWN0b3J5LW1hbmFnZXJzL1NhZmFyaURpcmVjdG9yeU1hbmFnZXJzJ1xuXG5kZWNsYXJlIGNvbnN0IE5ldXRyYWxpbm86IElOZXV0cmFsaW5vXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgUm9idXN0U2VsZWN0RGlyZWN0b3J5Q29tcG9uZW50IHtcbiAgQElucHV0KCkgbGFiZWwhOiBzdHJpbmcgLy8gXCJMYXVuY2hCb3hcIlxuICBASW5wdXQoKSBwaWNrZXJJZD86IHN0cmluZyAvLyBlbnN1cmVzIGxvYWRlZCBwYXRoIGlzIHNhbWUgYXMgcHJldmlvdXNcbiAgQElucHV0KCkgcmVsb2FkUGF0aD86IHN0cmluZyAvLyBDOlxcYmxhaFxcYmxhaFxuICBAT3V0cHV0KCkgZXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpXG4gIEBJbnB1dCgpIGRpcmVjdG9yeU1hbmFnZXI/OiBEaXJlY3RvcnlNYW5hZ2VyXG4gIEBPdXRwdXQoKSBkaXJlY3RvcnlNYW5hZ2VyQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEaXJlY3RvcnlNYW5hZ2VyPigpXG5cbiAgZ2V0UGlja2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGlja2VySWQgfHwgdGhpcy5nZXRJZCgpLnJlcGxhY2UoL1sgLV9dL2csJycpXG4gIH1cbiAgXG4gIGFzeW5jIG9uUGF0aFJlbG9hZChwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoIHR5cGVvZiBOZXV0cmFsaW5vID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGNvbnN0IGRtID0gbmV3IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyKHBhdGgpXG4gICAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgICB9XG4gIH1cblxuICBhc3luYyBzZWxlY3RQYXRoKCkge1xuICAgIGNvbnN0IGlzTmV1ID0gdHlwZW9mIE5ldXRyYWxpbm8gPT09ICdvYmplY3QnXG4gICAgaWYgKCBpc05ldSApIHtcbiAgICAgIGNvbnN0IG9wdGlvbnM6IEZvbGRlckRpYWxvZ09wdGlvbnMgPSB7fVxuXG4gICAgICBpZiAoIHRoaXMucmVsb2FkUGF0aCApIHtcbiAgICAgICAgb3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucmVsb2FkUGF0aFxuICAgICAgfVxuXG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBOZXV0cmFsaW5vLm9zLnNob3dGb2xkZXJEaWFsb2coXG4gICAgICAgICdTZWxlY3QgTGF1bmNoQm94IGRpcmVjdG9yeScsXG4gICAgICAgIG9wdGlvbnNcbiAgICAgIClcblxuICAgICAgaWYgKCByZXNwb25zZSApIHtcbiAgICAgICAgdGhpcy5yZWxvYWRQYXRoID0gcmVzcG9uc2VcbiAgICAgICAgY29uc3QgZG0gPSBuZXcgTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIocmVzcG9uc2UpXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5TWFuYWdlckNoYW5nZS5lbWl0KHRoaXMuZGlyZWN0b3J5TWFuYWdlciA9IGRtKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY2FuUGlja0RpciA9IHdpbmRvdy5zaG93RGlyZWN0b3J5UGlja2VyIGFzIGFueVxuXG4gICAgLy8gY2hyb21lXG4gICAgaWYgKCBjYW5QaWNrRGlyICkgeyAgXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBib3hEaXIgPSBhd2FpdCB3aW5kb3cuc2hvd0RpcmVjdG9yeVBpY2tlcih7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2V0UGlja2VySWQoKSxcbiAgICAgICAgICAvLyBpZDogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgIG1vZGU6ICdyZWFkd3JpdGUnXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGJveEZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoIGJveERpciApXG4gICAgICAgIGNvbnN0IGRtID0gbmV3IEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyKCcnLCBib3hGaWxlcywgYm94RGlyKVxuICAgICAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICBpZiAoIGVyci5tZXNzYWdlLmluY2x1ZGVzKCdhYm9ydGVkJykgKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lcnJvci5lbWl0KGVycilcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzYWZhcmlcbiAgICBpZiAoIHRoaXMuc2hvd0RpcmVjdG9yeVBpY2tlciApIHtcbiAgICAgIHRoaXMuc2hvd0RpcmVjdG9yeVBpY2tlcigpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzdXBwb3J0aW5nIGZ1bmN0aW9uYWxpdHkgdG8gZGlzcGxheSBhIGRpcmVjdG9yeSBwaWNrZXInKVxuICB9XG5cbiAgZ2V0SWQoKSB7XG4gICAgcmV0dXJuICdyb2J1c3RGb2xkZXJQaWNrZXItJyArIHRoaXMubGFiZWxcbiAgfVxuXG4gIHNob3dEaXJlY3RvcnlQaWNrZXIoKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5nZXRJZCgpKT8uY2xpY2soKVxuICB9XG5cbiAgLy8gc2FmYXJpIHJlYWQgZGlyZWN0b3J5XG4gIGFzeW5jIHJlYWRJbnB1dERpcmVjdG9yeShpbnB1dDogYW55KSB7XG4gICAgaWYgKCAhaW5wdXQuZmlsZXMgKSB7XG4gICAgICB0aGlzLmVycm9yLmVtaXQobmV3IEVycm9yKCdubyBkaXJlY3Rvcnkgd2l0aCBmaWxlcyBzZWxlY3RlZCcpKVxuICAgICAgcmV0dXJuIC8vIG5vIGZpbGVzIHNlbGVjdGVkXG4gICAgfVxuXG4gICAgY29uc3QgZmlsZXMgPSBPYmplY3QuZW50cmllcyhpbnB1dC5maWxlcykuZmlsdGVyKChba2V5XSkgPT4ga2V5ICE9ICdsZW5ndGgnKS5tYXAoKFtfa2V5LCB2YWx1ZV0pID0+IHZhbHVlKSBhcyBGaWxlW11cbiAgICBjb25zdCBkbSA9IG5ldyBTYWZhcmlEaXJlY3RvcnlNYW5hZ2VyKCcnLCBmaWxlcylcbiAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgfVxufVxuIiwiPCEtLSBzZWFyY2ggaGludHM6IHJlc2VsZWN0IC0tPlxuXG48aW5wdXQgY2xhc3M9XCJoaWRkZW5cIiB0eXBlPVwiZmlsZVwiIGRpcmVjdG9yeSBhY2NlcHQ9XCIuZm9sZGVyXCIgd2Via2l0ZGlyZWN0b3J5XG4gIFtpZF09XCIncm9idXN0Rm9sZGVyUGlja2VyLScgKyBsYWJlbFwiXG4gIFtuYW1lXT1cIidyb2J1c3RGb2xkZXJQaWNrZXItJyArIGxhYmVsXCJcbiAgKGNoYW5nZSk9XCJyZWFkSW5wdXREaXJlY3RvcnkoJGV2ZW50LnRhcmdldClcIlxuLz5cblxuPGJ1dHRvbiAqbmdJZj1cInJlbG9hZFBhdGhcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4MVwiXG4gIFt0aXRsZV0gPSBcInJlbG9hZFBhdGhcIlxuICAoY2xpY2spID0gXCJvblBhdGhSZWxvYWQocmVsb2FkUGF0aClcIlxuPvCflIQgUmVsb2FkPC9idXR0b24+XG5cbjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZmxleDFcIlxuICAoY2xpY2spPVwic2VsZWN0UGF0aCgpXCJcbiAgW2NsYXNzLm9wYWNpdHktODBdID0gXCJkaXJlY3RvcnlNYW5hZ2VyXCJcbj7wn5OBIHt7IGRpcmVjdG9yeU1hbmFnZXIgPyAncmUnIDogJycgfX1zZWxlY3Qge3sgbGFiZWwgfX0gZm9sZGVyPC9idXR0b24+XG5cbjxkaXYgKm5nSWY9XCJyZWxvYWRQYXRoXCIgY2xhc3M9XCJ0ZXh0LXhzXCI+XG4gIDxzdHJvbmc+e3sgbGFiZWwgfX0gcGF0aDo8L3N0cm9uZz4ge3sgcmVsb2FkUGF0aCB9fVxuPC9kaXY+XG4iXX0=