package com.example.meowapp

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    companion object {
        private const val CHANNEL = "com.example.meowapp/focus"
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {

                // Flutter → Kotlin: set focus active/inactive
                "setFocusActive" -> {
                    val active = call.argument<Boolean>("active") ?: false
                    FocusStateStore.isFocusActive = active
                    if (active) enableDnd() else disableDnd()
                    result.success(null)
                }

                // Flutter → Kotlin: push latest priority numbers
                "setPriorityNumbers" -> {
                    val numbers = call.argument<List<String>>("numbers") ?: emptyList()
                    FocusStateStore.priorityNumbers = numbers.toSet()
                    result.success(null)
                }

                // Flutter → Kotlin: check if DND permission is granted
                "isDndPermissionGranted" -> {
                    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    result.success(nm.isNotificationPolicyAccessGranted)
                }

                // Flutter → Kotlin: open DND permission settings
                "openDndSettings" -> {
                    startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
                    result.success(null)
                }

                // Flutter → Kotlin: open role manager to set this app as call screener
                "openCallScreeningSettings" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val intent = Intent(android.telecom.TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
                        startActivity(intent)
                    }
                    result.success(null)
                }

                else -> result.notImplemented()
            }
        }
    }

    private fun enableDnd() {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.isNotificationPolicyAccessGranted) {
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
        }
    }

    private fun disableDnd() {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.isNotificationPolicyAccessGranted) {
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
        }
    }
}
