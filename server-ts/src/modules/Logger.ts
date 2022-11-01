import { Message } from '../types';

export default class Logger {
  public static logIncomingMessage = (clientId: string, message: Message) => {
    console.log('==>', clientId, message);
  };

  public static logGenericError = (error: any) => {
    console.log(error);
  };
}
