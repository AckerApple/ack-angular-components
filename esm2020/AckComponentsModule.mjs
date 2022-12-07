import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { declarations as components } from "./declarations";
import * as i0 from "@angular/core";
import * as i1 from "./components/robust-select-directory/robust-select-directory.component";
export { CommonModule } from "@angular/common";
const declarations = [...components];
export class AckComponentsModule {
    static forRoot() {
        return {
            ngModule: AckComponentsModule,
        };
    }
}
AckComponentsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AckComponentsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, declarations: [i1.RobustSelectDirectoryComponent], imports: [CommonModule], exports: [i1.RobustSelectDirectoryComponent] });
AckComponentsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.4", ngImport: i0, type: AckComponentsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations,
                    exports: declarations
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrQ29tcG9uZW50c01vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9BY2tDb21wb25lbnRzTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxRQUFRLEVBQ1QsTUFBTSxlQUFlLENBQUE7QUFFdEIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBRzlDLE9BQU8sRUFBRSxZQUFZLElBQUksVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7OztBQUYzRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFJOUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFBO0FBUWpDLE1BQU0sT0FBTyxtQkFBbUI7SUFDakMsTUFBTSxDQUFDLE9BQU87UUFDWixPQUFPO1lBQ0wsUUFBUSxFQUFFLG1CQUFtQjtTQUM5QixDQUFBO0lBQ0gsQ0FBQzs7Z0hBTGEsbUJBQW1CO2lIQUFuQixtQkFBbUIsK0RBSi9CLFlBQVk7aUhBSUEsbUJBQW1CLFlBSi9CLFlBQVk7MkZBSUEsbUJBQW1CO2tCQU5sQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBQzt3QkFDTixZQUFZO3FCQUNiO29CQUNELFlBQVk7b0JBQ1osT0FBTyxFQUFFLFlBQVk7aUJBQ3RCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTW9kdWxlV2l0aFByb3ZpZGVycyxcbiAgTmdNb2R1bGVcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIlxuXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCJcbmV4cG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIlxuXG5pbXBvcnQgeyBkZWNsYXJhdGlvbnMgYXMgY29tcG9uZW50cyB9IGZyb20gXCIuL2RlY2xhcmF0aW9uc1wiXG5cbmNvbnN0IGRlY2xhcmF0aW9ucyA9IFsuLi5jb21wb25lbnRzXVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOltcbiAgICBDb21tb25Nb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zLFxuICBleHBvcnRzOiBkZWNsYXJhdGlvbnNcbn0pIGV4cG9ydCBjbGFzcyBBY2tDb21wb25lbnRzTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVyczxBY2tDb21wb25lbnRzTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBBY2tDb21wb25lbnRzTW9kdWxlLFxuICAgIH1cbiAgfVxufVxuIl19