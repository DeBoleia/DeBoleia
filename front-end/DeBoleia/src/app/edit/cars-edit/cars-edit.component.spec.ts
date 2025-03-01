import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsEditComponent } from './cars-edit.component';

describe('CarsEditComponent', () => {
  let component: CarsEditComponent;
  let fixture: ComponentFixture<CarsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
