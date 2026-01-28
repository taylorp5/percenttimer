import Foundation

struct Settings: Codable {
  let enabledMetrics: [String: Bool]
  let showLabel: Bool
  let theme: String
  let accentColor: String
}

struct CustomRange: Codable {
  let id: String
  let name: String
  let startISO: String
  let endISO: String
  let enabled: Bool
}

struct CustomDailyWindow: Codable {
  let id: String
  let name: String
  let startMinute: Int
  let endMinute: Int
  let enabled: Bool
}

struct AppState: Codable {
  let settings: Settings
  let customRanges: [CustomRange]
  let customDailyWindows: [CustomDailyWindow]

  static let `default` = AppState(
    settings: Settings(
      enabledMetrics: ["day": true, "week": true, "month": true, "year": true],
      showLabel: true,
      theme: "system",
      accentColor: "blue"
    ),
    customRanges: [],
    customDailyWindows: []
  )
}

struct MetricDisplay {
  let label: String
  let percent: Double
  let percentInt: Int
  let start: Date
  let end: Date
}
