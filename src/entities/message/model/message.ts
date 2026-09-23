export type Message = {
  id: number;
  isUser: boolean;
  text?: string;
  image?: string;
  time: string | Date;
  metadata: {
    delivery_status: string;
  };
};
