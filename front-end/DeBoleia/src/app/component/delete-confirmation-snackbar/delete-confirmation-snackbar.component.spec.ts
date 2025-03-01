import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConfirmationSnackbarComponent } from './delete-confirmation-snackbar.component';

describe('DeleteConfirmationSnackbarComponent', () => {
  let component: DeleteConfirmationSnackbarComponent;
  let fixture: ComponentFixture<DeleteConfirmationSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
