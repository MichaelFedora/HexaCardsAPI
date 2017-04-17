export class LogEntry {

  id: string;
  tags: string[];

  // all in `Error`

  subject: string;
  message: string;
  extra: string;

  public static fromAny(obj: any) {
    return new LogEntry(obj.id, obj.tags, obj.subject, obj.message, obj.extra);
  }

  constructor(logEntry?: LogEntry);
  constructor(id: string, tags: string[], subject: string, message: string, extra?: string);
  constructor(logEntryOrId?: LogEntry | string, tags?: string[], subject?: string, message?: string, extra?: string) {
    if(logEntryOrId instanceof LogEntry) {
      const other = logEntryOrId as LogEntry;
      this.id = other.id;
      this.tags = other.tags.slice();
      this.subject = other.subject;
      this.message = other.message;
      this.extra = other.extra;
    } else {
      this.id = logEntryOrId as string || '';
      this.tags = tags ? tags.slice() : [];
      this.subject = subject || '';
      this.message = message || '';
      this.extra = extra || '';
    }
  }


  toAny(): any {
    return {
      id: this.id,
      tags: this.tags,
      subject: this.subject,
      message: this.message,
      extra: this.extra
    };
  }
}
