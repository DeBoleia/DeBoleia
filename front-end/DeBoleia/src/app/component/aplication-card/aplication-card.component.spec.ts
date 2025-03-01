import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AplicationCardComponent } from './aplication-card.component';

describe('AplicationCardComponent', () => {
  let component: AplicationCardComponent;
  let fixture: ComponentFixture<AplicationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AplicationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AplicationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
