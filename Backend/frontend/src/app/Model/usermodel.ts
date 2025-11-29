export interface User {
  profilePicture: any;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  date: string;
  gender: string;
  bio: string;



}

export interface code{
  length: number;
  code:string;
  email: string;
}

export interface login{
  email:string;
  password:string;
}
export interface Token_password{
  token:string;
  NewPassword:string;
}
export interface resetEmail{
  email:string;
}