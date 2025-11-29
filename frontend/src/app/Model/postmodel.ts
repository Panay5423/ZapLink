export interface Song {
  title: string;
  artist: string;
  url: string;
}

export interface Post {
  PostImage: string;
  Posted_by: {
    _id: string;
    username: string;
    email: string;
  };
  Date: string;
  Caption: string;
  IsDeleted: boolean;
  Song?: Song; 
}
