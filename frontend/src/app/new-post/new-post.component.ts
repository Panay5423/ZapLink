import { Component, EventEmitter, Output } from '@angular/core';
import { PostService } from '../services/post.services';

@Component({
  selector: 'app-new-post',
  standalone: false,
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent {
  @Output() close = new EventEmitter<void>();

   user: any = JSON.parse(localStorage.getItem('user') || '{}');

  caption = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  songTitle = '';
  songArtist = '';
  songUrl = '';
  currentAudio: HTMLAudioElement | null = null;
  currentlyPlaying = '';
  
  isUploading = false;
isSuccess = false;


  songsList = [
    {
      title: 'Kesariya',
      artist: 'Arijit Singh',
      url: 'https://open.spotify.com/track/7qEHsqek33rTcFNT9PFqLf',
      cover: 'https://i.scdn.co/image/ab67616d0000b27354a3d7b8018f7de0d38b19f1',
      audio: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
    },
    {
      title: 'Calm Down',
      artist: 'Rema',
      url: 'https://open.spotify.com/track/0tBbt8CrmxbjRP0pueQkyU',
      cover: 'https://i.scdn.co/image/ab67616d0000b273f644321dbd2f1d0b9dbf943a',
      audio: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav'
    },
    {
      title: 'Apna Bana Le',
      artist: 'Arijit Singh',
      url: 'https://open.spotify.com/track/3ZFTkvIE7kyPt6Nu3PEa7V',
      cover: 'https://i.scdn.co/image/ab67616d0000b273d64cb723b2db7f62c4a7a688',
      audio: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav'
    }
  ];

  constructor(private postService: PostService) {}
 
onFileSelect(event: any) {
  const file = event.target.files[0];
  if (!file) return; 

  this.selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => (this.imagePreview = reader.result);
  reader.readAsDataURL(file); 
}


 
  playSong(song: any) {
    if (this.currentlyPlaying === song.title) {
      this.currentAudio?.pause();
      this.currentAudio = null;
      this.currentlyPlaying = '';
      return;
    }

    if (this.currentAudio) this.currentAudio.pause();

    this.currentAudio = new Audio(song.audio);
    this.currentAudio.play();
    this.currentlyPlaying = song.title;
  }

  selectSong(song: any) {
    this.songTitle = song.title;
    this.songArtist = song.artist;
    this.songUrl = song.url;
  }

submitPost() {
  const formData = new FormData();
  formData.append('Caption', this.caption);
  formData.append('Posted_by', this.user.id);
  formData.append('SongTitle', this.songTitle);
  formData.append('SongArtist', this.songArtist);
  formData.append('SongUrl', this.songUrl);

  if (this.selectedFile) {
    formData.append('PostImage', this.selectedFile);
  }

  this.isUploading = true; // Start loader

  this.postService.createPost(formData).subscribe({
next: () => {
  setTimeout(() => {
    this.isUploading = false;
    this.close.emit();
    window.location.reload();
  }, 1200); 
}

,
    error: () => {
      this.isUploading = false;
      console.error("Upload error");
    }
  });
}



}
