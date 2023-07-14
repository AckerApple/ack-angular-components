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
            return;
        }
        let message = 'Cannot find supporting functionality to display a directory picker.';
        if (window.location.host.includes('0.0.0.0')) {
            message = message + ' Try using localhost instead of 0.0.0.0';
        }
        throw new Error(message);
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
RobustSelectDirectoryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.4", type: RobustSelectDirectoryComponent, selector: "robust-select-directory", inputs: { label: "label", pickerId: "pickerId", reloadPath: "reloadPath", directoryManager: "directoryManager" }, outputs: { error: "error", directoryManagerChange: "directoryManagerChange" }, ngImport: i0, template: "<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: RobustSelectDirectoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'robust-select-directory', template: "<input class=\"hidden\" type=\"file\" directory accept=\".folder\" webkitdirectory\n  [id]=\"'robustFolderPicker-' + label\"\n  [name]=\"'robustFolderPicker-' + label\"\n  (change)=\"readInputDirectory($event.target)\"\n/>\n\n<button *ngIf=\"reloadPath\" type=\"button\" class=\"flex1\"\n  [title] = \"reloadPath\"\n  (click) = \"onPathReload(reloadPath)\"\n>\uD83D\uDD04 Reload</button>\n\n<button type=\"button\" class=\"flex1\"\n  (click)=\"selectPath()\"\n  [class.opacity-80] = \"directoryManager\"\n>\uD83D\uDCC1 {{ directoryManager ? 're' : '' }}select {{ label }} folder</button>\n\n<div *ngIf=\"reloadPath\" class=\"text-xs\">\n  <strong>{{ label }} path:</strong> {{ reloadPath }}\n</div>\n" }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvcm9idXN0LXNlbGVjdC1kaXJlY3Rvcnkvcm9idXN0LXNlbGVjdC1kaXJlY3RvcnkuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUUzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3REFBd0QsQ0FBQTtBQUU3RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQTs7O0FBUXpGLE1BQU0sT0FBTyw4QkFBOEI7SUFKM0M7UUFRWSxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVMsQ0FBQTtRQUVqQywyQkFBc0IsR0FBRyxJQUFJLFlBQVksRUFBb0IsQ0FBQTtLQTBGeEU7SUF4RkMsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxFQUFFLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZO1FBQzdCLElBQUssT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFHO1lBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDL0MsSUFBSSxDQUFD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QU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFXLENBQUE7UUFDcEgsTUFBTSxFQUFFLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDOUQsQ0FBQzs7MkhBL0ZVLDhCQUE4QjsrR0FBOUIsOEJBQThCLGdRQ2QzQyw4ckJBbUJBOzJGRExhLDhCQUE4QjtrQkFKMUMsU0FBUzsrQkFDRSx5QkFBeUI7OEJBSTFCLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0ksS0FBSztzQkFBZCxNQUFNO2dCQUNFLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFDSSxzQkFBc0I7c0JBQS9CLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXG5pbXBvcnQgeyBCcm93c2VyRGlyZWN0b3J5TWFuYWdlciB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9Ccm93c2VyRGlyZWN0b3J5TWFuYWdlcnMnXG5pbXBvcnQgeyBEaXJlY3RvcnlNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vZGlyZWN0b3J5LW1hbmFnZXJzL0RpcmVjdG9yeU1hbmFnZXJzJ1xuaW1wb3J0IHsgZGlyZWN0b3J5UmVhZFRvQXJyYXkgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvZGlyZWN0b3J5UmVhZFRvQXJyYXkuZnVuY3Rpb24nXG5pbXBvcnQgeyBGb2xkZXJEaWFsb2dPcHRpb25zLCBJTmV1dHJhbGlubyB9IGZyb20gJy4uLy4uL2RpcmVjdG9yeS1tYW5hZ2Vycy9OZXV0cmFsaW5vLnV0aWxzJ1xuaW1wb3J0IHsgTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIgfSBmcm9tICcuLi8uLi9kaXJlY3RvcnktbWFuYWdlcnMvTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXInXG5pbXBvcnQgeyBTYWZhcmlEaXJlY3RvcnlNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vZGlyZWN0b3J5LW1hbmFnZXJzL1NhZmFyaURpcmVjdG9yeU1hbmFnZXJzJ1xuXG5kZWNsYXJlIGNvbnN0IE5ldXRyYWxpbm86IElOZXV0cmFsaW5vXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3JvYnVzdC1zZWxlY3QtZGlyZWN0b3J5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgUm9idXN0U2VsZWN0RGlyZWN0b3J5Q29tcG9uZW50IHtcbiAgQElucHV0KCkgbGFiZWwhOiBzdHJpbmcgLy8gXCJMYXVuY2hCb3hcIlxuICBASW5wdXQoKSBwaWNrZXJJZD86IHN0cmluZyAvLyBlbnN1cmVzIGxvYWRlZCBwYXRoIGlzIHNhbWUgYXMgcHJldmlvdXNcbiAgQElucHV0KCkgcmVsb2FkUGF0aD86IHN0cmluZyAvLyBDOlxcYmxhaFxcYmxhaFxuICBAT3V0cHV0KCkgZXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpXG4gIEBJbnB1dCgpIGRpcmVjdG9yeU1hbmFnZXI/OiBEaXJlY3RvcnlNYW5hZ2VyXG4gIEBPdXRwdXQoKSBkaXJlY3RvcnlNYW5hZ2VyQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEaXJlY3RvcnlNYW5hZ2VyPigpXG5cbiAgZ2V0UGlja2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGlja2VySWQgfHwgdGhpcy5nZXRJZCgpLnJlcGxhY2UoL1sgLV9dL2csJycpXG4gIH1cbiAgXG4gIGFzeW5jIG9uUGF0aFJlbG9hZChwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoIHR5cGVvZiBOZXV0cmFsaW5vID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGNvbnN0IGRtID0gbmV3IE5ldXRyYWxpbm9EaXJlY3RvcnlNYW5hZ2VyKHBhdGgpXG4gICAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgICB9XG4gIH1cblxuICBhc3luYyBzZWxlY3RQYXRoKCkge1xuICAgIGNvbnN0IGlzTmV1ID0gdHlwZW9mIE5ldXRyYWxpbm8gPT09ICdvYmplY3QnXG4gICAgaWYgKCBpc05ldSApIHtcbiAgICAgIGNvbnN0IG9wdGlvbnM6IEZvbGRlckRpYWxvZ09wdGlvbnMgPSB7fVxuXG4gICAgICBpZiAoIHRoaXMucmVsb2FkUGF0aCApIHtcbiAgICAgICAgb3B0aW9ucy5kZWZhdWx0UGF0aCA9IHRoaXMucmVsb2FkUGF0aFxuICAgICAgfVxuXG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBOZXV0cmFsaW5vLm9zLnNob3dGb2xkZXJEaWFsb2coXG4gICAgICAgICdTZWxlY3QgTGF1bmNoQm94IGRpcmVjdG9yeScsXG4gICAgICAgIG9wdGlvbnNcbiAgICAgIClcblxuICAgICAgaWYgKCByZXNwb25zZSApIHtcbiAgICAgICAgdGhpcy5yZWxvYWRQYXRoID0gcmVzcG9uc2VcbiAgICAgICAgY29uc3QgZG0gPSBuZXcgTmV1dHJhbGlub0RpcmVjdG9yeU1hbmFnZXIocmVzcG9uc2UpXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5TWFuYWdlckNoYW5nZS5lbWl0KHRoaXMuZGlyZWN0b3J5TWFuYWdlciA9IGRtKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY2FuUGlja0RpciA9IHdpbmRvdy5zaG93RGlyZWN0b3J5UGlja2VyIGFzIGFueVxuXG4gICAgLy8gY2hyb21lXG4gICAgaWYgKCBjYW5QaWNrRGlyICkgeyAgXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBib3hEaXIgPSBhd2FpdCB3aW5kb3cuc2hvd0RpcmVjdG9yeVBpY2tlcih7XG4gICAgICAgICAgaWQ6IHRoaXMuZ2V0UGlja2VySWQoKSxcbiAgICAgICAgICAvLyBpZDogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgIG1vZGU6ICdyZWFkd3JpdGUnXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGJveEZpbGVzID0gYXdhaXQgZGlyZWN0b3J5UmVhZFRvQXJyYXkoIGJveERpciApXG4gICAgICAgIGNvbnN0IGRtID0gbmV3IEJyb3dzZXJEaXJlY3RvcnlNYW5hZ2VyKCcnLCBib3hGaWxlcywgYm94RGlyKVxuICAgICAgICB0aGlzLmRpcmVjdG9yeU1hbmFnZXJDaGFuZ2UuZW1pdCh0aGlzLmRpcmVjdG9yeU1hbmFnZXIgPSBkbSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICBpZiAoIGVyci5tZXNzYWdlLmluY2x1ZGVzKCdhYm9ydGVkJykgKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lcnJvci5lbWl0KGVycilcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzYWZhcmlcbiAgICBpZiAoIHRoaXMuc2hvd0RpcmVjdG9yeVBpY2tlciApIHtcbiAgICAgIHRoaXMuc2hvd0RpcmVjdG9yeVBpY2tlcigpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZSA9ICdDYW5ub3QgZmluZCBzdXBwb3J0aW5nIGZ1bmN0aW9uYWxpdHkgdG8gZGlzcGxheSBhIGRpcmVjdG9yeSBwaWNrZXIuJ1xuICAgIGlmICggd2luZG93LmxvY2F0aW9uLmhvc3QuaW5jbHVkZXMoJzAuMC4wLjAnKSApIHtcbiAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlICsgJyBUcnkgdXNpbmcgbG9jYWxob3N0IGluc3RlYWQgb2YgMC4wLjAuMCdcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbiAgfVxuXG4gIGdldElkKCkge1xuICAgIHJldHVybiAncm9idXN0Rm9sZGVyUGlja2VyLScgKyB0aGlzLmxhYmVsXG4gIH1cblxuICBzaG93RGlyZWN0b3J5UGlja2VyKCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZ2V0SWQoKSk/LmNsaWNrKClcbiAgfVxuXG4gIC8vIHNhZmFyaSByZWFkIGRpcmVjdG9yeVxuICBhc3luYyByZWFkSW5wdXREaXJlY3RvcnkoaW5wdXQ6IGFueSkge1xuICAgIGlmICggIWlucHV0LmZpbGVzICkge1xuICAgICAgdGhpcy5lcnJvci5lbWl0KG5ldyBFcnJvcignbm8gZGlyZWN0b3J5IHdpdGggZmlsZXMgc2VsZWN0ZWQnKSlcbiAgICAgIHJldHVybiAvLyBubyBmaWxlcyBzZWxlY3RlZFxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmVudHJpZXMoaW5wdXQuZmlsZXMpLmZpbHRlcigoW2tleV0pID0+IGtleSAhPSAnbGVuZ3RoJykubWFwKChbX2tleSwgdmFsdWVdKSA9PiB2YWx1ZSkgYXMgRmlsZVtdXG4gICAgY29uc3QgZG0gPSBuZXcgU2FmYXJpRGlyZWN0b3J5TWFuYWdlcignJywgZmlsZXMpXG4gICAgdGhpcy5kaXJlY3RvcnlNYW5hZ2VyQ2hhbmdlLmVtaXQodGhpcy5kaXJlY3RvcnlNYW5hZ2VyID0gZG0pXG4gIH1cbn1cbiIsIjxpbnB1dCBjbGFzcz1cImhpZGRlblwiIHR5cGU9XCJmaWxlXCIgZGlyZWN0b3J5IGFjY2VwdD1cIi5mb2xkZXJcIiB3ZWJraXRkaXJlY3RvcnlcbiAgW2lkXT1cIidyb2J1c3RGb2xkZXJQaWNrZXItJyArIGxhYmVsXCJcbiAgW25hbWVdPVwiJ3JvYnVzdEZvbGRlclBpY2tlci0nICsgbGFiZWxcIlxuICAoY2hhbmdlKT1cInJlYWRJbnB1dERpcmVjdG9yeSgkZXZlbnQudGFyZ2V0KVwiXG4vPlxuXG48YnV0dG9uICpuZ0lmPVwicmVsb2FkUGF0aFwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImZsZXgxXCJcbiAgW3RpdGxlXSA9IFwicmVsb2FkUGF0aFwiXG4gIChjbGljaykgPSBcIm9uUGF0aFJlbG9hZChyZWxvYWRQYXRoKVwiXG4+8J+UhCBSZWxvYWQ8L2J1dHRvbj5cblxuPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJmbGV4MVwiXG4gIChjbGljayk9XCJzZWxlY3RQYXRoKClcIlxuICBbY2xhc3Mub3BhY2l0eS04MF0gPSBcImRpcmVjdG9yeU1hbmFnZXJcIlxuPvCfk4Ege3sgZGlyZWN0b3J5TWFuYWdlciA/ICdyZScgOiAnJyB9fXNlbGVjdCB7eyBsYWJlbCB9fSBmb2xkZXI8L2J1dHRvbj5cblxuPGRpdiAqbmdJZj1cInJlbG9hZFBhdGhcIiBjbGFzcz1cInRleHQteHNcIj5cbiAgPHN0cm9uZz57eyBsYWJlbCB9fSBwYXRoOjwvc3Ryb25nPiB7eyByZWxvYWRQYXRoIH19XG48L2Rpdj5cbiJdfQ==