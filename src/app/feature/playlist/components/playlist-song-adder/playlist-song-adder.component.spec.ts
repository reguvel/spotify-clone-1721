import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSongAdderComponent } from './playlist-song-adder.component';

describe('PlaylistSongAdderComponent', () => {
  let component: PlaylistSongAdderComponent;
  let fixture: ComponentFixture<PlaylistSongAdderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistSongAdderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistSongAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
