import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScamscrollerComponent } from './scamscroller.component';

describe('ScamscrollerComponent', () => {
  let component: ScamscrollerComponent;
  let fixture: ComponentFixture<ScamscrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScamscrollerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScamscrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
