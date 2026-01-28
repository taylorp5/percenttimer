package com.percenttime.widgets

import android.appwidget.AppWidgetManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import com.percenttime.R
import java.util.Date

object WidgetRenderer {
  private const val DEFAULT_ACCENT = "#3B82F6"
  private const val LABEL_COLOR = "#6B7280"
  private const val TRACK_COLOR = "#1A000000"

  fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int, layoutId: Int) {
    val metricId = WidgetPrefs.getMetricForWidget(context, widgetId) ?: "day"
    val stateJson = WidgetPrefs.statePrefs(context).getString(WidgetPrefs.STATE_KEY, null)
    val state = WidgetState.fromJson(stateJson)
    val result = WidgetCalculator.compute(metricId, state, Date(System.currentTimeMillis()))

    val accentColor = resolveAccentColor(state.settings.accentColor)
    val views = RemoteViews(context.packageName, layoutId)
    views.setTextViewText(R.id.widget_percent, "${result.percentInt}%")
    views.setTextColor(R.id.widget_percent, accentColor)

    val nightMode = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
    val backgroundRes = if (nightMode == Configuration.UI_MODE_NIGHT_YES) {
      R.drawable.widget_bg_dark
    } else {
      R.drawable.widget_bg_light
    }
    views.setInt(R.id.widget_root, "setBackgroundResource", backgroundRes)

    val refreshTint = if (nightMode == Configuration.UI_MODE_NIGHT_YES) {
      Color.parseColor("#CCFFFFFF")
    } else {
      Color.parseColor("#AA000000")
    }
    views.setInt(R.id.widget_refresh, "setColorFilter", refreshTint)

    if (layoutId == R.layout.percenttime_widget_circle) {
      val ringBackground = if (nightMode == Configuration.UI_MODE_NIGHT_YES) {
        R.drawable.widget_ring_bg_dark
      } else {
        R.drawable.widget_ring_bg_light
      }
      views.setImageViewResource(R.id.widget_ring_bg, ringBackground)
      views.setImageViewResource(R.id.widget_ring_progress, R.drawable.widget_ring_progress)
      views.setInt(R.id.widget_ring_progress, "setImageLevel", result.percentInt * 100)
      views.setInt(R.id.widget_ring_progress, "setColorFilter", accentColor)
    } else {
      views.setProgressBar(R.id.widget_progress, 100, result.percentInt, false)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        val tint = ColorStateList.valueOf(accentColor)
        views.setColorStateList(R.id.widget_progress, "setProgressTintList", tint)
        views.setColorStateList(
          R.id.widget_progress,
          "setProgressBackgroundTintList",
          ColorStateList.valueOf(Color.parseColor(TRACK_COLOR))
        )
      }
    }

    if (result.showLabel) {
      views.setTextViewText(R.id.widget_label, result.label)
      views.setTextColor(R.id.widget_label, Color.parseColor(LABEL_COLOR))
      views.setViewVisibility(R.id.widget_label, android.view.View.VISIBLE)
    } else {
      views.setViewVisibility(R.id.widget_label, android.view.View.GONE)
    }

    val refreshIntent = Intent(WidgetUpdateScheduler.ACTION_REFRESH_WIDGET).apply {
      setPackage(context.packageName)
      putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
    }
    val refreshPendingIntent = PendingIntent.getBroadcast(
      context,
      widgetId + 10000,
      refreshIntent,
      pendingFlags()
    )
    views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent)

    val openUri = Uri.parse("exp+percenttime://timer?metric=${Uri.encode(metricId)}")
    val openIntent = Intent(Intent.ACTION_VIEW, openUri).apply {
      setPackage(context.packageName)
    }
    val openPendingIntent = PendingIntent.getActivity(
      context,
      widgetId,
      openIntent,
      pendingFlags()
    )
    views.setOnClickPendingIntent(R.id.widget_root, openPendingIntent)

    appWidgetManager.updateAppWidget(widgetId, views)
  }

  private fun pendingFlags(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
  }

  private fun resolveAccentColor(accent: String?): Int {
    val value = accent?.trim()?.lowercase()
    val hex = when (value) {
      "blue" -> "#3B82F6"
      "green" -> "#22C55E"
      "orange" -> "#F97316"
      "purple" -> "#8B5CF6"
      "pink" -> "#EC4899"
      "teal" -> "#14B8A6"
      else -> if (value?.startsWith("#") == true) value else DEFAULT_ACCENT
    }
    return try {
      Color.parseColor(hex)
    } catch (_: IllegalArgumentException) {
      Color.parseColor(DEFAULT_ACCENT)
    }
  }
}
