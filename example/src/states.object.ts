import { ExtraOptions, RouterModule, Routes } from '@angular/router'
import { Component} from '@angular/core'
import { ComponentsExamples } from './ComponentsExamples.component'
import { OverviewExamples } from './OverviewExamples.component'

@Component({template:''}) export class FakeComponent{}

export const declarations = [
  FakeComponent
]

export const menu = [
  {
    name: 'overview',
    path: 'overview',
    component: OverviewExamples,
    data:{
      title:"Overview"
    },
  },{
    name: 'components',
    path: 'components',
    component: ComponentsExamples,
    data:{
      title:"Components"
    }
  }]

export const routes: Routes = [
  ...menu,
  {path: '',   redirectTo: 'overview', pathMatch: 'full' },//default route
  {path: '**',   redirectTo: 'overview' }//404
]

export const routeConfig: ExtraOptions = {
  useHash:true,
  initialNavigation: 'enabledNonBlocking',
  enableTracing:false
}
export const routing = RouterModule.forRoot(routes, routeConfig)
