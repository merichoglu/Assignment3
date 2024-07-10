export interface User {
  username: string;
  isAdmin: boolean;
  email?: string;
  name?: string;
  surname?: string;
  birthdate?: Date;
  gender?: string;
  location?: string;
  accessLogs?: any[];
}
