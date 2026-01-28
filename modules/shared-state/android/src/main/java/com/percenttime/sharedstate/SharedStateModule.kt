package com.percenttime.sharedstate

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SharedStateModule : Module() {
  // SharedPreferences name and key used by widgets/native code.
  private val prefsName = "percenttime_shared_state"
  private val sharedKey = "shared_state_json"

  override fun definition() = ModuleDefinition {
    Name("SharedState")

    Function("setSharedState") { jsonString: String ->
      prefs()?.edit()?.putString(sharedKey, jsonString)?.apply()
      null
    }

    Function("getSharedState") {
      prefs()?.getString(sharedKey, null)
    }

    Function("refreshWidgets") {
      val context = runtimeContext.reactContext ?: return@Function null
      val manager = AppWidgetManager.getInstance(context)
      val providers = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        manager.getInstalledProvidersForPackage(context.packageName, null)
      } else {
        manager.installedProviders
      }
      providers?.forEach { provider ->
        val ids = manager.getAppWidgetIds(provider.provider)
        if (ids.isNotEmpty()) {
          val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
            component = provider.provider
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
          }
          context.sendBroadcast(intent)
        }
      }
      null
    }
  }

  private fun prefs() =
    runtimeContext.reactContext?.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
}
