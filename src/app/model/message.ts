export interface Message {
  senderUsername: string;
  receiverUsername: string;
  timestamp: Date;
  title: string;
  content: string;
}
