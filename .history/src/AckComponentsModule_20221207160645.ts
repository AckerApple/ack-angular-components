import {
  ModuleWithProviders,
  NgModule
} from "@angular/core"

import { CommonModule } from "@angular/common"
export { CommonModule } from "@angular/common"

import { declarations as components } from "./declarations"

const declarations = [...components]

@NgModule({
  imports:[
    CommonModule
  ],
  declarations,
  exports: declarations
}) export class AckComponentsModule {
  static forRoot(): ModuleWithProviders<AckModule> {
    return {
      ngModule: AckModule,
    }
  }
}

// export default AckModule