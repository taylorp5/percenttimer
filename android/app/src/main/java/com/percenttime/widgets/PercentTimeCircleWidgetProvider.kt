package com.percenttime.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent

class PercentTimeCircleWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    WidgetUpdateScheduler.ensureScheduled(context)
    appWidgetIds.forEach { updateWidget(context, appWidgetManager, it) }
  }

  override fun onDeleted(context: Context, appWidgetIds: IntArray) {
    appWidgetIds.forEach { WidgetPrefs.clearMetricForWidget(context, it) }
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    val manager = AppWidgetManager.getInstance(context)
    when (intent.action) {
      AppWidgetManager.ACTION_APPWIDGET_UPDATE -> {
        val ids = intent.getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS)
        if (ids != null && ids.isNotEmpty()) {
          ids.forEach { updateWidget(context, manager, it) }
        } else {
          updateAllWidgets(context, manager)
        }
      }
      WidgetUpdateScheduler.ACTION_REFRESH_WIDGET -> {
        val widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
        if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
          updateWidget(context, manager, widgetId)
        } else {
          updateAllWidgets(context, manager)
        }
      }
    }
  }

  companion object {
    fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
      WidgetRenderer.updateWidget(context, appWidgetManager, widgetId, com.percenttime.R.layout.percenttime_widget_circle)
    }

    fun updateAllWidgets(context: Context, appWidgetManager: AppWidgetManager = AppWidgetManager.getInstance(context)) {
      val ids = appWidgetManager.getAppWidgetIds(ComponentName(context, PercentTimeCircleWidgetProvider::class.java))
      ids.forEach { updateWidget(context, appWidgetManager, it) }
    }
  }
}
