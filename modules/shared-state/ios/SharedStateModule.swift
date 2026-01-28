import ExpoModulesCore
import WidgetKit

public class SharedStateModule: Module {
  // App Group suiteName for widget access.
  private let appGroupIdentifier = "group.com.percenttime"
  // Key used by the app and widgets.
  private let sharedKey = "percenttime_shared_state"

  public func definition() -> ModuleDefinition {
    Name("SharedState")

    Function("setSharedState") { (jsonString: String) in
      let defaults = UserDefaults(suiteName: appGroupIdentifier)
      defaults?.set(jsonString, forKey: sharedKey)
    }

    Function("getSharedState") -> String? {
      let defaults = UserDefaults(suiteName: appGroupIdentifier)
      return defaults?.string(forKey: sharedKey)
    }

    Function("refreshWidgets") {
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
import ExpoModulesCore

public class SharedStateModule: Module {
  // App Group suiteName for widget access.
  private let appGroupIdentifier = "group.com.percenttime"
  // Key used by the app and widgets.
  private let sharedKey = "percenttime_shared_state"

  public func definition() -> ModuleDefinition {
    Name("SharedState")

    Function("setSharedState") { (jsonString: String) in
      let defaults = UserDefaults(suiteName: appGroupIdentifier)
      defaults?.set(jsonString, forKey: sharedKey)
    }

    Function("getSharedState") -> String? {
      let defaults = UserDefaults(suiteName: appGroupIdentifier)
      return defaults?.string(forKey: sharedKey)
    }
  }
}
