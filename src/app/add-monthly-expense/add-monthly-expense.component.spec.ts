import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMonthlyExpenseComponent } from './add-monthly-expense.component';

describe('AddMonthlyExpenseComponent', () => {
  let component: AddMonthlyExpenseComponent;
  let fixture: ComponentFixture<AddMonthlyExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMonthlyExpenseComponent]
    });
    fixture = TestBed.createComponent(AddMonthlyExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
