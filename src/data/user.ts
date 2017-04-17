export class User {

  id: string;
  name: string;

  tokenSecret: string;
  tokenExp: Date;

  username: string;
  salt: string;
  password: string;

  /**
   * From data transfer object
   * @param {any} dto the data transfer object
   */
  static fromDTO(dto: any): User {
    return new User(dto.id, dto.name, '');
  }

  /**
   * From data transfer object (w/ password)
   * @param {any} dto the data transfer object
   */
  static fromDTOWithPass(dto: any): User {
    return new User(dto.id, dto.name, dto.password);
  }

  /**
   * From database object
   * @param {any} dbo the database object
   */
  static fromDBO(dbo: any): User {
    return new User(dbo.id, dbo.name, dbo.password);
  }

  constructor(user?: User);
  constructor(id: string, name: string, password: string);
  constructor(userOrId?: User | string, name?: string, password?: string) {
    if(userOrId instanceof User) {
      const other = userOrId as User;
      this.id = other.id;
      this.name = other.name;
      this.password = other.password;
    } else {
      this.id = userOrId as string || '';
      this.name = name || '';
      this.password = password || '';
    }
  }

  toDTO(): any {
    return {
      id: this.id,
      name: this.name
    };
  }

  toDBO(): any {
    return {
      id: this.id,
      name: this.name,
      password: this.password
    }
  }
}
