import UIKit
import InstantSearch
import InstantSearchCore

class ViewController: HitsTableViewController {

    // Create your widgets
    let searchBar = SearchBarWidget(frame: .zero)
    let stats = StatsLabelWidget(frame: .zero)
    let tableView = HitsTableWidget(frame: .zero)

    override func viewDidLoad() {
        super.viewDidLoad()

        initUI()

        // and assign tableView to InstantSearch
        hitsTableView = tableView

        // Add all widgets to InstantSearch
        InstantSearch.shared.registerAllWidgets(in: self.view)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath, containing hit: [String : Any]) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "hitCell", for: indexPath)

        cell.textLabel?.highlightedTextColor = .blue
        cell.textLabel?.highlightedBackgroundColor = .yellow
        cell.textLabel?.highlightedText = SearchResults.highlightResult(hit: hit, path: "{{attributesToDisplay.[0]}}")?.value

        return cell
    }

    func initUI() {
        // Add the declared views to the main view
        self.view.addSubview(searchBar)
        self.view.addSubview(stats)
        self.view.addSubview(tableView)

        // Add autolayout constraints
        searchBar.translatesAutoresizingMaskIntoConstraints = false
        stats.translatesAutoresizingMaskIntoConstraints = false
        tableView.translatesAutoresizingMaskIntoConstraints = false

        let views = ["searchBar": searchBar, "stats": stats, "tableView": tableView]
        var constraints = [NSLayoutConstraint]()
        constraints += NSLayoutConstraint.constraints(withVisualFormat: "V:|-30-[searchBar]-10-[stats]-10-[tableView]-|", options: [], metrics: nil, views:views)
        constraints += NSLayoutConstraint.constraints(withVisualFormat: "H:|-25-[searchBar]-25-|", options: [], metrics: nil, views:views)
        constraints += NSLayoutConstraint.constraints(withVisualFormat: "H:|-25-[stats]-25-|", options: [], metrics: nil, views:views)
        constraints += NSLayoutConstraint.constraints(withVisualFormat: "H:|-[tableView]-|", options: [], metrics: nil, views:views)
        NSLayoutConstraint.activate(constraints)

        // Register tableView identifier
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "hitCell")

        // Style the stats label
        stats.textAlignment = .center
        stats.font = UIFont.boldSystemFont(ofSize:18.0)
    }

}

