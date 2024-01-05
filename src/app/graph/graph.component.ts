import {
  Component,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent
  implements OnInit, OnDestroy
{

  @Input() expenses: any = [];


  chartOptions =  {
    animationEnabled: true,
    theme: "dark2",
    exportEnabled: true,
    subtitles: [{
      text: "Expense Categorization"
    }],
    data: [{
    type: "doughnut", //change type to column, line, area, line, etc
    indexLabel: "{name}: {y}₹",
    dataPoints: this.expenses
    }]
  }
  chart!: any;
  timeout: any = null;

  constructor(private sharedService: SharedService) {
    this.sharedService.graphData$.subscribe((newData: any[]) => {
      // Handle changes to graphData here
      this.expenses = newData;
      this.updateChart();
    });
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }
  
  getChartInstance(chart: object) {
    if(chart) {
      this.chart = chart;
      this.chart?.render();
      this.updateChart();  
    }
  }

  updateChart = () =>  {
    this.chartOptions = {
      animationEnabled: true,
      theme: 'dark2',
      exportEnabled: true,
      
      subtitles: [
        {
          text: 'Expense Categorization',
        },
      ],
      data: [
        {
          type: 'doughnut', //change type to column, line, area, doughnut, etc
          indexLabel: '{name}: {y}₹',
          dataPoints: this.expenses,
        },
      ],
    };
    if(this.chart !== null && this.chart !== undefined) {
      this.chart?.render();
    }
    this.timeout = setTimeout(this.updateChart, 1000);
  }
}
