export class Team {

  id: string;
  name: string;
  color: string;

  public static fromAny(obj: any) {
    return new Team(obj.id, obj.name, obj.color);
  }

  constructor(team?: Team);
  constructor(id: string, name: string, color: string);
  constructor(teamOrId?: Team | string, name?: string, color?: string) {
    if(teamOrId instanceof Team) {
      const other = teamOrId as Team;
      this.id = other.id;
      this.name = other.name;
      this.color = other.color;
    } else {
      this.id = teamOrId as string || '';
      this.name = name || '';
      this.color = color || '';
    }
  }

  toAny(): any {
    return {
      id: this.id,
      name: this.name,
      color: this.color
    };
  }
}
