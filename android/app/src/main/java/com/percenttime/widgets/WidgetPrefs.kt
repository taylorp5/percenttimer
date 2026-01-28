package com.percenttime.widgets

import android.content.Context
import android.content.SharedPreferences

object WidgetPrefs {
  const val STATE_PREFS = "percenttime_shared_state"
  const val STATE_KEY = "shared_state_json"

  private const val WIDGET_PREFS = "percenttime_widget_prefs"
  private const val METRIC_PREFIX = "widget_metric_"

  fun statePrefs(context: Context): SharedPreferences =
    context.getSharedPreferences(STATE_PREFS, Context.MODE_PRIVATE)

  fun widgetPrefs(context: Context): SharedPreferences =
    context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)

  fun getMetricForWidget(context: Context, widgetId: Int): String? =
    widgetPrefs(context).getString("$METRIC_PREFIX$widgetId", null)

  fun setMetricForWidget(context: Context, widgetId: Int, metricId: String) {
    widgetPrefs(context).edit().putString("$METRIC_PREFIX$widgetId", metricId).apply()
  }

  fun clearMetricForWidget(context: Context, widgetId: Int) {
    widgetPrefs(context).edit().remove("$METRIC_PREFIX$widgetId").apply()
  }
}
