package com.percenttime.widgets

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

class WidgetUpdateWorker(appContext: Context, params: WorkerParameters) : Worker(appContext, params) {
  override fun doWork(): Result {
    WidgetUpdateScheduler.updateAllWidgets(applicationContext)
    return Result.success()
  }
}

