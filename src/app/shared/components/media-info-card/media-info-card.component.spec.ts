import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaInfoCardComponent } from './media-info-card.component';

describe('MediaInfoCardComponent', () => {
  let component: MediaInfoCardComponent;
  let fixture: ComponentFixture<MediaInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaInfoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
