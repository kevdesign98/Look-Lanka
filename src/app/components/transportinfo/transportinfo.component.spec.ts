import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportinfoComponent } from './transportinfo.component';

describe('TransportinfoComponent', () => {
  let component: TransportinfoComponent;
  let fixture: ComponentFixture<TransportinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportinfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
