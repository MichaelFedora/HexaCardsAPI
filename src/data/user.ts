export class User {

  id: string;
  username: string; // email?

  tokenSecret: string;
  tokenExp: Date;

  salt: string;
  password: string;

  /**
   * From data transfer object
   * @param {any} dto the data transfer object
   */
  static fromDTO(dto: any): User {
    return new User(dto.id, dto.name, dto.username);
  }

  /**
   * From data transfer object (w/ password)
   * @param {any} dto the data transfer object
   */
  static fromDTOWithPass(dto: any): User {
    return new User(dto.id, dto.username, dto.password);
  }

  /**
   * From database object
   * @param {any} dbo the database object
   */
  static fromDBO(dbo: any): User {
    return new User(dbo.id, dbo.username, dbo.password,
        dbo.salt, dbo.tokenSecret, dbo.tokenExp);
  }

  constructor(user?: User);
  constructor(id: string, username: string, password?: string);
  constructor(id: string, username: string, password: string,
      salt: string, tokenSecret: string, tokenExp: Date);
  constructor(userOrId?: User | string, username?: string, password?: string,
      salt?: string, tokenSecret?: string, tokenExp?: Date) {

    if(userOrId instanceof User) {
      const other = userOrId as User;
      this.id = other.id;
      this.username = other.username;
      this.password = other.password;
      this.salt = other.salt;
      this.tokenSecret = other.tokenSecret;
      this.tokenExp = new Date(other.tokenExp.getTime());
    } else {
      this.id = userOrId as string || '';
      this.username = username || '';
      this.password = password || '';
      this.salt = salt || '';
      this.tokenSecret = tokenSecret || '';
      this.tokenExp = tokenExp ? new Date(tokenExp.getTime()) : new Date();
    }
  }

  toDTO(): any {
    return {
      id: this.id,
      username: this.username
    };
  }

  toDBO(): any {
    return {
      id: this.id,
      username: this.username,

      tokenSecret: this.tokenSecret,
      tokenExp: this.tokenExp,

      salt: this.salt,
      password: this.password
    }
  }

  updateFromDTO(dto: any) {
    dto = User.fromDTO(dto);
    // this.name = dto.name;
  }
}
