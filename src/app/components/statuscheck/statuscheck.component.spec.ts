import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuscheckComponent } from './statuscheck.component';

describe('StatuscheckComponent', () => {
  let component: StatuscheckComponent;
  let fixture: ComponentFixture<StatuscheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatuscheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatuscheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
