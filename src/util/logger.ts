import { Database } from '../db';
import { LogEntry } from '../data';

export class Logger {

  public static init(): void { }

  public static log(subject: string, message: string, tags?: string[], extra?: string): void {
    console.log('[LOG][' + subject + ']:', message);
    tags = tags || ['log'];
    Database.log.create(new LogEntry('', tags, subject, message, extra));
  }

  public static error(subject: string, error?: any, tags?: string[]): void {
    console.log('[ERROR][' + subject + ']:', error);
    tags = tags || (error.name ? ['error', error.name] : ['error']);
    Database.log.create(new LogEntry('', tags, subject, error.message ? error.message : '', error.stack ? error.stack : ''));
  }

  private constructor() { }

}
