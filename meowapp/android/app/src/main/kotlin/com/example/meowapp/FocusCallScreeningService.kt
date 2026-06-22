package com.example.meowapp

import android.telecom.Call
import android.telecom.CallScreeningService

/**
 * Android CallScreeningService — invoked for EVERY incoming call before the phone rings.
 * Blocks the call silently if focus mode is active and the number is not whitelisted.
 *
 * Must be declared in AndroidManifest.xml and the user must grant the
 * "Default caller ID & spam app" or "Call screening" role via system settings.
 */
class FocusCallScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val number = callDetails.handle?.schemeSpecificPart ?: ""

        val response = if (FocusStateStore.isCallAllowed(number)) {
            // Let the call ring normally
            CallResponse.Builder()
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .setSkipCallLog(false)
                .setSkipNotification(false)
                .build()
        } else {
            // Block silently — no ring, no notification, call logged as blocked
            CallResponse.Builder()
                .setDisallowCall(true)
                .setRejectCall(true)
                .setSilenceCall(true)
                .setSkipCallLog(false)
                .setSkipNotification(true)
                .build()
        }

        respondToCall(callDetails, response)
    }
}
