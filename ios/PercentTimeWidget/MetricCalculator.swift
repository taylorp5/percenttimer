import Foundation

enum MetricCalculator {
  private static let isoFormatterWithFraction: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  private static let isoFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime]
    return formatter
  }()

  static func compute(metricId: String, state: AppState, now: Date) -> MetricDisplay {
    if metricId == "day" {
      return makeDisplay(label: "Day", start: dayRange(now).start, end: dayRange(now).end, now: now)
    }
    if metricId == "week" {
      let range = weekRange(now)
      return makeDisplay(label: "Week", start: range.start, end: range.end, now: now)
    }
    if metricId == "month" {
      let range = monthRange(now)
      return makeDisplay(label: "Month", start: range.start, end: range.end, now: now)
    }
    if metricId == "year" {
      let range = yearRange(now)
      return makeDisplay(label: "Year", start: range.start, end: range.end, now: now)
    }

    if metricId.hasPrefix("range:") {
      let id = metricId.replacingOccurrences(of: "range:", with: "")
      if let range = state.customRanges.first(where: { $0.id == id }) {
        let start = parseISO(range.startISO) ?? dayRange(now).start
        let end = parseISO(range.endISO) ?? dayRange(now).end
        if end <= start {
          let fallback = dayRange(now)
          return makeDisplay(label: range.name, start: fallback.start, end: fallback.end, now: now)
        }
        return makeDisplay(label: range.name, start: start, end: end, now: now)
      }
    }

    if metricId.hasPrefix("daily:") {
      let id = metricId.replacingOccurrences(of: "daily:", with: "")
      if let window = state.customDailyWindows.first(where: { $0.id == id }) {
        let range = dailyWindowRange(now, startMinute: window.startMinute, endMinute: window.endMinute)
        return makeDisplay(label: window.name, start: range.start, end: range.end, now: now)
      }
    }

    let fallback = dayRange(now)
    return makeDisplay(label: "Day", start: fallback.start, end: fallback.end, now: now)
  }

  private static func makeDisplay(label: String, start: Date, end: Date, now: Date) -> MetricDisplay {
    let duration = end.timeIntervalSince(start)
    let progress = duration <= 0 ? 0 : (now.timeIntervalSince(start) / duration)
    let clamped = max(0, min(1, progress))
    return MetricDisplay(
      label: label,
      percent: clamped,
      percentInt: Int((clamped * 100).rounded()),
      start: start,
      end: end
    )
  }

  private static func parseISO(_ value: String) -> Date? {
    if let date = isoFormatterWithFraction.date(from: value) {
      return date
    }
    return isoFormatter.date(from: value)
  }

  private static func calendar() -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.firstWeekday = 2 // Monday
    return calendar
  }

  private static func dayRange(_ now: Date) -> (start: Date, end: Date) {
    let cal = calendar()
    let start = cal.startOfDay(for: now)
    let end = cal.date(byAdding: .day, value: 1, to: start) ?? now
    return (start, end)
  }

  private static func weekRange(_ now: Date) -> (start: Date, end: Date) {
    let cal = calendar()
    let startOfDay = cal.startOfDay(for: now)
    let weekday = cal.component(.weekday, from: startOfDay)
    let diff = (weekday + 5) % 7
    let start = cal.date(byAdding: .day, value: -diff, to: startOfDay) ?? startOfDay
    let end = cal.date(byAdding: .day, value: 7, to: start) ?? now
    return (start, end)
  }

  private static func monthRange(_ now: Date) -> (start: Date, end: Date) {
    let cal = calendar()
    let components = cal.dateComponents([.year, .month], from: now)
    let start = cal.date(from: components) ?? now
    let end = cal.date(byAdding: .month, value: 1, to: start) ?? now
    return (start, end)
  }

  private static func yearRange(_ now: Date) -> (start: Date, end: Date) {
    let cal = calendar()
    let components = DateComponents(year: cal.component(.year, from: now), month: 1, day: 1)
    let start = cal.date(from: components) ?? now
    let end = cal.date(byAdding: .year, value: 1, to: start) ?? now
    return (start, end)
  }

  private static func dailyWindowRange(
    _ now: Date,
    startMinute: Int,
    endMinute: Int
  ) -> (start: Date, end: Date) {
    let cal = calendar()
    let startOfDay = cal.startOfDay(for: now)

    let minutesNow = cal.component(.hour, from: now) * 60 + cal.component(.minute, from: now)
    let overnight = endMinute <= startMinute

    func dateFor(minutes: Int, base: Date) -> Date {
      let hours = minutes / 60
      let mins = minutes % 60
      return cal.date(bySettingHour: hours, minute: mins, second: 0, of: base) ?? base
    }

    if !overnight {
      let start = dateFor(minutes: startMinute, base: startOfDay)
      let end = dateFor(minutes: endMinute, base: startOfDay)
      return (start, end)
    }

    if minutesNow >= startMinute {
      let start = dateFor(minutes: startMinute, base: startOfDay)
      let endBase = cal.date(byAdding: .day, value: 1, to: startOfDay) ?? startOfDay
      let end = dateFor(minutes: endMinute, base: endBase)
      return (start, end)
    }

    let startBase = cal.date(byAdding: .day, value: -1, to: startOfDay) ?? startOfDay
    let start = dateFor(minutes: startMinute, base: startBase)
    let end = dateFor(minutes: endMinute, base: startOfDay)
    return (start, end)
  }
}
