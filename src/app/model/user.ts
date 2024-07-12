export interface User {
  username: string;
  password?: string;
  isAdmin: boolean;
  email?: string;
  name?: string;
  surname?: string;
  birthdate?: Date;
  gender?: string;
  location?: string;
  accessLogs?: any[];
}
