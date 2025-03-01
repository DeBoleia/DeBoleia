import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingEvaluationDialogComponent } from './pending-evaluation-dialog.component';

describe('PendingEvaluationDialogComponent', () => {
  let component: PendingEvaluationDialogComponent;
  let fixture: ComponentFixture<PendingEvaluationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingEvaluationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingEvaluationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
