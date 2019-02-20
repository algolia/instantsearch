type IndexArgs = {
  indexName: string;
  indexId?: string;
};

export class Index {
  public indexName: string;
  public indexId: string;
  public widgets: any[];

  constructor({ indexName, indexId = indexName }: IndexArgs) {
    this.indexName = indexName;
    this.indexId = indexId;
    this.widgets = [];
  }

  public addWidgets(widgets: any[]) {
    this.widgets = this.widgets.concat(widgets);

    return this;
  }

  public render() {
    // avoid to throw
  }
}

const createIndex = (args: IndexArgs) => new Index(args);

export default createIndex;
