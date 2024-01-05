import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from './graph.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';



@NgModule({
  declarations: [
    GraphComponent
  ],
  imports: [
    CommonModule,
    CanvasJSAngularChartsModule
  ],
  exports: [
    GraphComponent
  ]
})
export class GraphModule { }
