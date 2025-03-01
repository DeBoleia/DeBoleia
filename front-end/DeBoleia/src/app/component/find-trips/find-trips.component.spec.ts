import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTripsComponent } from './find-trips.component';

describe('FindTripsComponent', () => {
  let component: FindTripsComponent;
  let fixture: ComponentFixture<FindTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindTripsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
