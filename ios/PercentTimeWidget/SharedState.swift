import Foundation

enum SharedStateReader {
  static let appGroupIdentifier = "group.com.taylor.percenttimer"
  static let sharedKey = "percenttime_shared_state"

  static func loadState() -> AppState? {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let json = defaults.string(forKey: sharedKey),
      let data = json.data(using: .utf8)
    else {
      return nil
    }

    let decoder = JSONDecoder()
    return try? decoder.decode(AppState.self, from: data)
  }
}
