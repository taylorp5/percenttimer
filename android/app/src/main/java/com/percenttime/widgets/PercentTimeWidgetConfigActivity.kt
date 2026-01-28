package com.percenttime.widgets

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.ScrollView
import android.widget.TextView

class PercentTimeWidgetConfigActivity : Activity() {
  private var appWidgetId: Int = AppWidgetManager.INVALID_APPWIDGET_ID
  private var selectedMetricId: String = "day"
  private lateinit var selectionLabel: TextView
  private val radioMap = mutableMapOf<Int, String>()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    appWidgetId = intent?.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
      ?: AppWidgetManager.INVALID_APPWIDGET_ID

    if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
      finish()
      return
    }

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val scroll = ScrollView(this)
    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(40, 40, 40, 24)
    }

    val title = TextView(this).apply {
      text = "Choose a metric"
      textSize = 18f
    }
    content.addView(title)

    selectionLabel = TextView(this).apply {
      textSize = 14f
      setPadding(0, 12, 0, 12)
    }
    content.addView(selectionLabel)

    val stateJson = WidgetPrefs.statePrefs(this).getString(WidgetPrefs.STATE_KEY, null)
    val state = WidgetState.fromJson(stateJson)

    val currentSelection = WidgetPrefs.getMetricForWidget(this, appWidgetId) ?: "day"
    selectedMetricId = currentSelection

    val radioGroup = RadioGroup(this).apply {
      orientation = RadioGroup.VERTICAL
    }

    addSection(
      content,
      radioGroup,
      "Built-in",
      listOf(
        "day" to "Day",
        "week" to "Week",
        "month" to "Month",
        "year" to "Year"
      )
    )

    addSection(
      content,
      radioGroup,
      "Custom ranges",
      state.customRanges.map { "custom_range:${it.id}" to it.name }
    )

    addSection(
      content,
      radioGroup,
      "Daily windows",
      state.customDailyWindows.map { "custom_daily:${it.id}" to it.name }
    )

    radioGroup.setOnCheckedChangeListener { _, checkedId ->
      radioMap[checkedId]?.let { metricId ->
        selectedMetricId = metricId
        selectionLabel.text = "Selected: ${labelFor(metricId, state)}"
      }
    }

    if (radioMap.isNotEmpty()) {
      val selectedEntry = radioMap.entries.firstOrNull { it.value == selectedMetricId }
        ?: radioMap.entries.first()
      selectedMetricId = selectedEntry.value
      radioGroup.check(selectedEntry.key)
      selectionLabel.text = "Selected: ${labelFor(selectedMetricId, state)}"
    }

    content.addView(radioGroup)
    scroll.addView(content)

    val scrollParams = LinearLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      0,
      1f
    )
    root.addView(scroll, scrollParams)

    val saveButton = Button(this).apply {
      text = "Save"
      setOnClickListener { saveSelection(selectedMetricId) }
    }
    val saveContainer = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(40, 12, 40, 40)
      addView(saveButton)
    }

    root.addView(saveContainer)
    setContentView(root)
  }

  private fun addSection(
    container: LinearLayout,
    radioGroup: RadioGroup,
    title: String,
    options: List<Pair<String, String>>
  ) {
    val header = TextView(this).apply {
      text = title
      textSize = 13f
      setPadding(0, 20, 0, 8)
    }
    container.addView(header)

    if (options.isEmpty()) {
      val empty = TextView(this).apply {
        text = "None"
        textSize = 13f
        setPadding(0, 0, 0, 4)
      }
      container.addView(empty)
      return
    }

    options.forEach { (metricId, label) ->
      val radio = RadioButton(this).apply {
        text = label
      }
      radioMap[radio.id] = metricId
      radioGroup.addView(radio)
    }
  }

  private fun labelFor(metricId: String, state: WidgetState): String {
    return when {
      metricId == "day" -> "Day"
      metricId == "week" -> "Week"
      metricId == "month" -> "Month"
      metricId == "year" -> "Year"
      metricId.startsWith("custom_range:") -> {
        val id = metricId.removePrefix("custom_range:")
        state.customRanges.firstOrNull { it.id == id }?.name ?: "Custom range"
      }
      metricId.startsWith("custom_daily:") -> {
        val id = metricId.removePrefix("custom_daily:")
        state.customDailyWindows.firstOrNull { it.id == id }?.name ?: "Daily window"
      }
      else -> "Day"
    }
  }

  private fun saveSelection(metricId: String) {
    WidgetPrefs.setMetricForWidget(this, appWidgetId, metricId)

    val manager = AppWidgetManager.getInstance(this)
    val providerInfo = manager.getAppWidgetInfo(appWidgetId)
    val providerClass = providerInfo.provider.className

    val layoutId = if (providerClass.contains("Small")) {
      com.percenttime.R.layout.percenttime_widget_small
    } else if (providerClass.contains("Circle")) {
      com.percenttime.R.layout.percenttime_widget_circle
    } else {
      com.percenttime.R.layout.percenttime_widget_medium
    }

    WidgetRenderer.updateWidget(this, manager, appWidgetId, layoutId)

    val resultValue = Intent().apply {
      putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
    }
    setResult(Activity.RESULT_OK, resultValue)
    finish()
  }
}
