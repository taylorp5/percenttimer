package com.percenttime.widgets

import org.json.JSONArray
import org.json.JSONObject

data class WidgetSettings(
  val showLabel: Boolean,
  val dayStartMinutes: Int,
  val accentColor: String
)

data class CustomRangeData(
  val id: String,
  val name: String,
  val startISO: String,
  val endISO: String,
  val enabled: Boolean
)

data class CustomDailyWindowData(
  val id: String,
  val name: String,
  val startMinute: Int,
  val endMinute: Int,
  val enabled: Boolean
)

data class WidgetState(
  val settings: WidgetSettings,
  val customRanges: List<CustomRangeData>,
  val customDailyWindows: List<CustomDailyWindowData>
) {
  companion object {
    fun fromJson(json: String?): WidgetState {
      if (json.isNullOrBlank()) return defaultState()
      return try {
        val obj = JSONObject(json)
        val settingsObj = obj.getJSONObject("settings")
        val showLabel = settingsObj.optBoolean("showLabel", true)
        val dayStartMinutes = settingsObj.optInt("dayStartMinutes", 0)
        val accentColor = settingsObj.optString("accentColor", "blue")

        val ranges = parseRanges(obj.optJSONArray("customRanges"))
        val daily = parseDaily(obj.optJSONArray("customDailyWindows"))

        WidgetState(
          settings = WidgetSettings(showLabel, dayStartMinutes, accentColor),
          customRanges = ranges,
          customDailyWindows = daily
        )
      } catch (_: Exception) {
        defaultState()
      }
    }

    private fun parseRanges(array: JSONArray?): List<CustomRangeData> {
      if (array == null) return emptyList()
      val items = mutableListOf<CustomRangeData>()
      for (i in 0 until array.length()) {
        val obj = array.optJSONObject(i) ?: continue
        items.add(
          CustomRangeData(
            id = obj.optString("id", ""),
            name = obj.optString("name", "Custom Range"),
            startISO = obj.optString("startISO", ""),
            endISO = obj.optString("endISO", ""),
            enabled = obj.optBoolean("enabled", true)
          )
        )
      }
      return items
    }

    private fun parseDaily(array: JSONArray?): List<CustomDailyWindowData> {
      if (array == null) return emptyList()
      val items = mutableListOf<CustomDailyWindowData>()
      for (i in 0 until array.length()) {
        val obj = array.optJSONObject(i) ?: continue
        items.add(
          CustomDailyWindowData(
            id = obj.optString("id", ""),
            name = obj.optString("name", "Custom Window"),
            startMinute = obj.optInt("startMinute", 0),
            endMinute = obj.optInt("endMinute", 0),
            enabled = obj.optBoolean("enabled", true)
          )
        )
      }
      return items
    }

    private fun defaultState() = WidgetState(
      settings = WidgetSettings(showLabel = true, dayStartMinutes = 0, accentColor = "blue"),
      customRanges = emptyList(),
      customDailyWindows = emptyList()
    )
  }
}


