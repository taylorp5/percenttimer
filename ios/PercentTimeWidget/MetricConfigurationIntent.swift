import AppIntents

struct MetricEntity: AppEntity, Identifiable {
  static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Metric")
  static var defaultQuery = MetricQuery()

  let id: String
  let name: String

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(name)")
  }
}

struct MetricQuery: EntityQuery {
  func suggestedEntities() async throws -> [MetricEntity] {
    return MetricQuery.loadAllMetrics()
  }

  func entities(for identifiers: [MetricEntity.ID]) async throws -> [MetricEntity] {
    let all = MetricQuery.loadAllMetrics()
    let lookup = Set(identifiers)
    return all.filter { lookup.contains($0.id) }
  }

  private static func loadAllMetrics() -> [MetricEntity] {
    let state = SharedStateReader.loadState() ?? AppState.default
    var items: [MetricEntity] = [
      MetricEntity(id: "day", name: "Day"),
      MetricEntity(id: "week", name: "Week"),
      MetricEntity(id: "month", name: "Month"),
      MetricEntity(id: "year", name: "Year")
    ]
    items.append(contentsOf: state.customRanges.map { MetricEntity(id: "range:\($0.id)", name: $0.name) })
    items.append(contentsOf: state.customDailyWindows.map { MetricEntity(id: "daily:\($0.id)", name: $0.name) })
    return items
  }
}

struct MetricConfigurationIntent: AppIntent {
  static var title: LocalizedStringResource = "PercentTime Metric"
  static var description = IntentDescription("Choose which metric to display.")

  @Parameter(title: "Metric")
  var metric: MetricEntity?

  static var parameterSummary: some ParameterSummary {
    Summary("Show \(\.$metric)")
  }
}
