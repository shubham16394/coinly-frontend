import { Component, Input, OnInit, AfterContentInit, OnChanges, SimpleChanges, AfterContentChecked } from '@angular/core';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit, AfterContentInit, OnChanges, AfterContentChecked {
  @Input() type!: string;

  @Input() dateOrMonth!: Date;

  @Input() expenses!: object;

  @Input() budget!: object;

  xTitle!: string;
  chartOptions!: object;
  chart!: any;

  ngOnInit(): void {
    console.log('GraphComponent called');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes)
    // this.budget = changes?.['budget']?.currentValue;
    // this.expenses = changes?.['expenses']?.currentValue;
    this.ngAfterContentInit();
  }

  ngAfterContentInit(): void {
    console.log('budget', this.budget, 'expenses', this.expenses, this.dateOrMonth, this.chart)
    if (this.type === 'daily') {
      this.xTitle = 'Hours';
    } else if (this.type === 'monthly') {
      this.xTitle = 'Days';
    }
    console.log(this.xTitle);
    this.chartOptions = {
      animationEnabled: true,
      // title:{
      // 	text: "Average Monthly Rainfall"
      // },
      theme: 'dark1',
      axisX: {
        title: this.xTitle,
      },
      axisY: {
        title: 'Money (₹)',
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: 'pointer',
        itemclick: function (e: any) {
          if (
            typeof e.dataSeries.visible === 'undefined' ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
      },
      data: [
        {
          type: 'spline',
          showInLegend: true,
          name: 'Budget',
          dataPoints: this.budget,
        },
        {
          type: 'spline',
          showInLegend: true,
          name: 'Expense',
          dataPoints: this.expenses,
        },
      ],
    };

    this.chart.render()

  }

  ngAfterContentChecked(): void {
      console.log(this.budget, this.expenses)
  }

  getChartInstance(chart: object) {
    console.log('chart', chart)
    this.chart = chart;
    this.chart.render();
    // this.updateData();
  }

  updateData() {
    this.chartOptions = {
      animationEnabled: true,
      // title:{
      // 	text: "Average Monthly Rainfall"
      // },
      theme: 'dark1',
      axisX: {
        title: this.xTitle,
      },
      axisY: {
        title: 'Money (₹)',
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: 'pointer',
        itemclick: function (e: any) {
          if (
            typeof e.dataSeries.visible === 'undefined' ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
      },
      data: [
        {
          type: 'spline',
          showInLegend: true,
          name: 'Budget',
          dataPoints: this.budget,
        },
        {
          type: 'spline',
          showInLegend: true,
          name: 'Expense',
          dataPoints: this.expenses,
        },
      ],
    };
    this.chart.render();
  }


}
