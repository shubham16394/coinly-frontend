import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private graphDataSubject = new BehaviorSubject<any[]>([]);
  graphData$ = this.graphDataSubject.asObservable();

  updateGraphData(newData: any[]) {
    this.graphDataSubject.next(newData);
  }
}
