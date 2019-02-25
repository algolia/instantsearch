type IndexArgs = {
  indexName: string;
  indexId?: string;
};

type Node = {
  instance: any;
  parent: Node | null;
  indices: any[];
  widgets: any[];
  helper: any;
};

export class Index {
  public indexName: string;
  public indexId: string;
  public widgets: any[];
  public node?: Node;

  constructor({ indexName, indexId = indexName }: IndexArgs) {
    this.indexName = indexName;
    this.indexId = indexId;
    this.widgets = [];
  }

  public addWidgets(widgets: any[]) {
    if (this.node) {
      this.node.instance.addWidgets(widgets, this.node);
    } else {
      this.widgets = this.widgets.concat(widgets);
    }

    return this;
  }

  public removeWidgets(widgets: any[]) {
    if (this.node) {
      this.node.instance.removeWidgets(widgets, this.node);
    } else {
      widgets.forEach(widget => {
        this.widgets = this.widgets.filter(w => w !== widget);
      });
    }

    return this;
  }

  public render() {
    // avoid to throw
  }
}

const createIndex = (args: IndexArgs) => new Index(args);

export default createIndex;
