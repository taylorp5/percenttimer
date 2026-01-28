package com.percenttime.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object WidgetUpdateScheduler {
  const val ACTION_REFRESH_WIDGET = "com.percenttime.widgets.ACTION_REFRESH_WIDGET"
  private const val UNIQUE_WORK_NAME = "percenttime_widget_update"

  fun ensureScheduled(context: Context) {
    val request = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(30, TimeUnit.MINUTES)
      .build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
      UNIQUE_WORK_NAME,
      ExistingPeriodicWorkPolicy.KEEP,
      request
    )
  }

  fun updateAllWidgets(context: Context) {
    val appWidgetManager = AppWidgetManager.getInstance(context)
    PercentTimeSmallWidgetProvider.updateAllWidgets(context, appWidgetManager)
    PercentTimeMediumWidgetProvider.updateAllWidgets(context, appWidgetManager)
    PercentTimeCircleWidgetProvider.updateAllWidgets(context, appWidgetManager)
  }
}
