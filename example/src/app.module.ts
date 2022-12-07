window["strapTime"] = Date.now()
import { AckModule, AckRouterModule } from "ack-angular"
import { getServerTime } from "./functions"
import { NgModule } from "@angular/core";
import { AckFxModule } from "ack-angular-fx"
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core'
import { NgxPageScrollModule } from "ngx-page-scroll"

import { AckAppStage } from "./AckAppStage.component"
import {
  declarations as states, routing
} from "./states.object"
import { OverviewExamples } from "./OverviewExamples.component"
import { ComponentsExamples } from "./ComponentsExamples.component"

export const declarations = [
  AckAppStage,
  OverviewExamples,
  ComponentsExamples,
  ...states
]

import { FormsModule } from "@angular/forms";

import { HttpClientModule } from "@angular/common/http";

export const imports = [
  BrowserModule,
  BrowserAnimationsModule,
  FormsModule,
  HttpClientModule,
  routing,
  NgxPageScrollCoreModule.forRoot({}),
  NgxPageScrollModule,
  AckRouterModule, // AckRouterModule.forRoot(),
  AckModule, // AckModule.forRoot(),
  // AckOfflineModule.forRoot(),
  AckFxModule
]

console.log("declarations",declarations)

@NgModule({
  imports,
  declarations,
  providers:[],
  bootstrap: [ AckAppStage ],
}) export class AppModule {}

console.log("Ng Define Time", Date.now()-window["strapTime"]+"ms", "@", getServerTime())