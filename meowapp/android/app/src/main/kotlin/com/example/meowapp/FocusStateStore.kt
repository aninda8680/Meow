package com.example.meowapp

/**
 * Singleton that holds the current focus session state.
 * Shared between MainActivity (MethodChannel updates) and
 * FocusCallScreeningService (call blocking decisions).
 */
object FocusStateStore {
    @Volatile var isFocusActive: Boolean = false
    @Volatile var priorityNumbers: Set<String> = emptySet()

    /** Normalise a phone number to digits only for comparison. */
    fun normalise(number: String): String =
        number.filter { it.isDigit() }

    /** Returns true if the call should be allowed through. */
    fun isCallAllowed(incomingNumber: String): Boolean {
        if (!isFocusActive) return true
        val clean = normalise(incomingNumber)
        return priorityNumbers.any { p ->
            val cp = normalise(p)
            clean.endsWith(cp) || cp.endsWith(clean)
        }
    }
}
