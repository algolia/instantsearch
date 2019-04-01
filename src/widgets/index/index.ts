type IndexArgs = {
  indexName: string;
  indexId?: string;
};

type Node = {
  instance: any;
  parent: Node | null;
  indexId: string;
  widgets: any[];
  helper: any;
  derivedHelper: any;
  unsubscribeDerivedHelper: () => void;
};

export class Index {
  public $$type = Symbol.for('ais.index');
  public indexName: string;
  public indexId: string;
  public widgets: any[];
  public node: Node | null = null;

  constructor({ indexName, indexId = indexName }: IndexArgs) {
    this.indexName = indexName;
    this.indexId = indexId;
    this.widgets = [];
  }

  public addWidgets(widgets: any[]) {
    this.widgets = this.widgets.concat(widgets);

    if (this.node !== null) {
      this.node.instance.addWidgets(widgets, this.node);
    }

    return this;
  }

  public removeWidgets(widgets: any[]) {
    this.widgets = this.widgets.filter(w => !widgets.includes(w));

    if (this.node !== null) {
      this.node.instance.removeWidgets(widgets, this.node);
    }

    return this;
  }

  public render() {
    // avoid to throw
  }

  public dispose() {
    // avoid to throw
  }

  public getWidgetState() {
    // avoid to throw
  }

  public getWidgetSearchParameters() {
    // avoid to throw
  }
}

const createIndex = (args: IndexArgs) => new Index(args);

export default createIndex;
