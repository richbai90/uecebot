export default class PropertySet<T> extends Set<T> {
  propertyName: string;
  constructor(propertyName: string) {
    super();
    this.propertyName = propertyName;
  }

  add(item: T): this {
    for (const existing of this) {
      if (existing[this.propertyName] === item[this.propertyName]) {
        return this; // Item with this property value already exists
      }
    }
    super.add(item);
    return this;
  }

  has(item: T): boolean {
    for (const existing of this) {
      if (existing[this.propertyName] === item[this.propertyName]) {
        return true;
      }
    }
    return false;
  }
}
