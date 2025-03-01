import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarBrandDetailsComponent } from './car-brand-details.component';

describe('CarBrandDetailsComponent', () => {
  let component: CarBrandDetailsComponent;
  let fixture: ComponentFixture<CarBrandDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarBrandDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBrandDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
