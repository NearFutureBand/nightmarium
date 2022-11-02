import { Message } from '../types';
import fs from 'fs';
import dayjs from 'dayjs';

class Logger {
  private stream: fs.WriteStream;

  constructor() {
    this.stream = fs.createWriteStream(`logs/logs_${dayjs().format('MM.DD_HH:mm:ss')}`);
  }

  private stringify(object: any) {
    return JSON.stringify(object, null, 2);
  }

  private t() {
    return dayjs().format('DD.MM:HH:mm:ss');
  }

  private template(messageType?: string) {
    return `${this.t()} ${messageType}:`;
  }

  public logIncomingMessage = (clientId: string, message: Message) => {
    console.log('==>', clientId, message);
    this.stream.write(`------------------------\n${this.template('===> MESSAGE')} ${clientId} ${this.stringify(message)} \n`);
  };

  public log(messageType: string, object: any) {
    this.stream.write(`${this.template(messageType)} ${this.stringify(object)}\n`);
  }

  public logGenericError = (error: any) => {
    console.log(error);
  };
}

export default new Logger();
