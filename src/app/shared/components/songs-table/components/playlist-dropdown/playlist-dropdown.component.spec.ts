import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistDropdownComponent } from './playlist-dropdown.component';

describe('PlaylistDropdownComponent', () => {
  let component: PlaylistDropdownComponent;
  let fixture: ComponentFixture<PlaylistDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
