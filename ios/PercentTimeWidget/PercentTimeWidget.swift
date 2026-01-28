import SwiftUI
import WidgetKit

struct MetricEntry: TimelineEntry {
  let date: Date
  let configuration: MetricConfigurationIntent
  let display: MetricDisplay
}

struct Provider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> MetricEntry {
    MetricEntry(
      date: Date(),
      configuration: MetricConfigurationIntent(),
      display: MetricDisplay(label: "Day", percent: 0.5, percentInt: 50, start: Date(), end: Date())
    )
  }

  func snapshot(for configuration: MetricConfigurationIntent, in context: Context) async -> MetricEntry {
    return makeEntry(configuration: configuration, now: Date())
  }

  func timeline(for configuration: MetricConfigurationIntent, in context: Context) async -> Timeline<MetricEntry> {
    let entry = makeEntry(configuration: configuration, now: Date())
    let nextRefresh = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
    return Timeline(entries: [entry], policy: .after(nextRefresh))
  }

  private func makeEntry(configuration: MetricConfigurationIntent, now: Date) -> MetricEntry {
    let state = SharedStateReader.loadState() ?? AppState.default
    let metricId = configuration.metric?.id ?? "day"
    let display = MetricCalculator.compute(metricId: metricId, state: state, now: now)
    return MetricEntry(date: now, configuration: configuration, display: display)
  }
}

struct PercentTimeWidgetEntryView: View {
  @Environment(\.widgetFamily) private var family
  let entry: MetricEntry

  var body: some View {
    switch family {
    case .accessoryCircular:
      Gauge(value: entry.display.percent, in: 0...1) {
        Text(entry.display.label)
      } currentValueLabel: {
        Text("\(entry.display.percentInt)%")
      }
      .gaugeStyle(.accessoryCircular)
    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 4) {
        Text(entry.display.label)
          .font(.caption2)
          .foregroundStyle(.secondary)
        Text("\(entry.display.percentInt)%")
          .font(.headline)
        ThinProgressBar(progress: entry.display.percent)
      }
      .padding(.vertical, 2)
    default:
      VStack(alignment: .leading, spacing: 8) {
        Text(entry.display.label)
          .font(.caption)
          .foregroundStyle(.secondary)
        Text("\(entry.display.percentInt)%")
          .font(.system(size: 34, weight: .semibold))
        ThinProgressBar(progress: entry.display.percent)
      }
      .padding(12)
    }
  }
}

struct ThinProgressBar: View {
  let progress: Double

  var body: some View {
    GeometryReader { geo in
      let width = max(0, min(1, progress)) * geo.size.width
      ZStack(alignment: .leading) {
        Capsule()
          .fill(Color.secondary.opacity(0.25))
        Capsule()
          .fill(Color.accentColor)
          .frame(width: width)
      }
    }
    .frame(height: 6)
  }
}

struct PercentTimeWidget: Widget {
  let kind = "PercentTimeWidget"

  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: kind, intent: MetricConfigurationIntent.self, provider: Provider()) { entry in
      PercentTimeWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("PercentTime")
    .description("Show progress for a selected metric.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
  }
}
