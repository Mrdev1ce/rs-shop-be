type MapperArgs = { header: string; value: any };

export class FieldsMapper<TEntity extends object> {
  constructor(
    private mappers: Partial<Record<keyof TEntity, (value: any) => any>>
  ) {}

  protected map({ header, value }: MapperArgs) {
    const mapper = this.mappers[header];
    if (mapper) {
      return mapper(value);
    }
    return value;
  }

  public getMapper() {
    return this.map.bind(this);
  }
}
