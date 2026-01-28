package com.percenttime.widgets

import java.time.Instant
import java.util.Calendar
import java.util.Date

object WidgetCalculator {
  data class Result(
    val label: String,
    val percentInt: Int,
    val showLabel: Boolean
  )

  fun compute(metricId: String, state: WidgetState, now: Date): Result {
    val resolvedMetricId = normalizeMetricId(metricId)
    return when {
      resolvedMetricId == "day" -> {
        val range = dayRange(now, state.settings.dayStartMinutes)
        result("Day", range.first, range.second, now, state.settings.showLabel)
      }
      resolvedMetricId == "week" -> {
        val range = weekRange(now)
        result("Week", range.first, range.second, now, state.settings.showLabel)
      }
      resolvedMetricId == "month" -> {
        val range = monthRange(now)
        result("Month", range.first, range.second, now, state.settings.showLabel)
      }
      resolvedMetricId == "year" -> {
        val range = yearRange(now)
        result("Year", range.first, range.second, now, state.settings.showLabel)
      }
      resolvedMetricId.startsWith("custom_range:") -> {
        val id = resolvedMetricId.removePrefix("custom_range:")
        val item = state.customRanges.firstOrNull { it.id == id }
        if (item == null) {
          val range = dayRange(now, state.settings.dayStartMinutes)
          result("Custom Range", range.first, range.second, now, state.settings.showLabel)
        } else {
          val start = parseISO(item.startISO)
          val end = parseISO(item.endISO)
          if (start == null || end == null || end <= start) {
            val range = dayRange(now, state.settings.dayStartMinutes)
            result(item.name, range.first, range.second, now, state.settings.showLabel)
          } else {
            result(item.name, start, end, now, state.settings.showLabel)
          }
        }
      }
      resolvedMetricId.startsWith("custom_daily:") -> {
        val id = resolvedMetricId.removePrefix("custom_daily:")
        val item = state.customDailyWindows.firstOrNull { it.id == id }
        if (item == null) {
          val range = dayRange(now, state.settings.dayStartMinutes)
          result("Custom Window", range.first, range.second, now, state.settings.showLabel)
        } else {
          val range = dailyWindowRange(now, item.startMinute, item.endMinute)
          result(item.name, range.first, range.second, now, state.settings.showLabel)
        }
      }
      else -> {
        val range = dayRange(now, state.settings.dayStartMinutes)
        result("Day", range.first, range.second, now, state.settings.showLabel)
      }
    }
  }

  private fun normalizeMetricId(metricId: String): String {
    return when {
      metricId.startsWith("range:") -> "custom_range:" + metricId.removePrefix("range:")
      metricId.startsWith("daily:") -> "custom_daily:" + metricId.removePrefix("daily:")
      else -> metricId
    }
  }
  private fun result(label: String, start: Date, end: Date, now: Date, showLabel: Boolean): Result {
    val duration = end.time - start.time
    val ratio = if (duration <= 0) 0.0 else (now.time - start.time).toDouble() / duration.toDouble()
    val clamped = ratio.coerceIn(0.0, 1.0)
    return Result(label, (clamped * 100).toInt(), showLabel)
  }

  private fun parseISO(value: String): Date? {
    return try {
      Date.from(Instant.parse(value))
    } catch (_: Exception) {
      null
    }
  }

  private fun dayRange(now: Date, dayStartMinutes: Int): Pair<Date, Date> {
    val cal = Calendar.getInstance()
    cal.time = now
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    val start = Calendar.getInstance()
    start.time = cal.time
    start.set(Calendar.HOUR_OF_DAY, dayStartMinutes / 60)
    start.set(Calendar.MINUTE, dayStartMinutes % 60)

    if (now.before(start.time)) {
      start.add(Calendar.DAY_OF_YEAR, -1)
    }

    val end = Calendar.getInstance()
    end.time = start.time
    end.add(Calendar.DAY_OF_YEAR, 1)
    return Pair(start.time, end.time)
  }

  private fun weekRange(now: Date): Pair<Date, Date> {
    val cal = Calendar.getInstance()
    cal.firstDayOfWeek = Calendar.MONDAY
    cal.time = now
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)

    val day = cal.get(Calendar.DAY_OF_WEEK)
    val diff = (day + 5) % 7
    cal.add(Calendar.DAY_OF_YEAR, -diff)
    val start = cal.time
    cal.add(Calendar.DAY_OF_YEAR, 7)
    val end = cal.time
    return Pair(start, end)
  }

  private fun monthRange(now: Date): Pair<Date, Date> {
    val cal = Calendar.getInstance()
    cal.time = now
    cal.set(Calendar.DAY_OF_MONTH, 1)
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    val start = cal.time
    cal.add(Calendar.MONTH, 1)
    val end = cal.time
    return Pair(start, end)
  }

  private fun yearRange(now: Date): Pair<Date, Date> {
    val cal = Calendar.getInstance()
    cal.time = now
    cal.set(Calendar.MONTH, Calendar.JANUARY)
    cal.set(Calendar.DAY_OF_MONTH, 1)
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    val start = cal.time
    cal.add(Calendar.YEAR, 1)
    val end = cal.time
    return Pair(start, end)
  }

  private fun dailyWindowRange(now: Date, startMinute: Int, endMinute: Int): Pair<Date, Date> {
    val cal = Calendar.getInstance()
    cal.time = now
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)

    val minutesNow = now.hours * 60 + now.minutes
    val overnight = endMinute <= startMinute

    val start = Calendar.getInstance()
    start.time = cal.time
    start.set(Calendar.HOUR_OF_DAY, startMinute / 60)
    start.set(Calendar.MINUTE, startMinute % 60)

    val end = Calendar.getInstance()
    end.time = cal.time
    end.set(Calendar.HOUR_OF_DAY, endMinute / 60)
    end.set(Calendar.MINUTE, endMinute % 60)

    if (!overnight) {
      return Pair(start.time, end.time)
    }

    if (minutesNow >= startMinute) {
      end.add(Calendar.DAY_OF_YEAR, 1)
      return Pair(start.time, end.time)
    }

    start.add(Calendar.DAY_OF_YEAR, -1)
    return Pair(start.time, end.time)
  }
}



