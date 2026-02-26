import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapscanvasComponent } from './mapscanvas.component';

describe('MapscanvasComponent', () => {
  let component: MapscanvasComponent;
  let fixture: ComponentFixture<MapscanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapscanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapscanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
