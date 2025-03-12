package com.margelo.nitro.broadcastevent

import com.facebook.proguard.annotations.DoNotStrip

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.*


@DoNotStrip
class BroadcastEvent : HybridBroadcastEventSpec() {

    companion object {
        const val DEFAULT_CATEGORY = "android.intent.category.DEFAULT"
    }

    private val registeredReceivers = mutableListOf<BroadcastReceiver>()

    /**
     * Prepare and send broadcast event data
     */
    private fun displayScanResult(intent: Intent, actionNames: List<String>, eventName: String) {
        val eventData = WritableNativeMap()

        for (actionName in actionNames) {
            val value = intent.getStringExtra(actionName)
            if (value != null) {
                eventData.putString(actionName, value)
            } else {
                logDebug("displayScanResult", "Key '$actionName' has no data.")
            }
        }

        sendEvent(eventName, eventData)
        logDebug("displayScanResult", "Event '$eventName' sent with data: $eventData")
    }

    /**
     * Unregister a broadcast receiver
     */
    override fun unregister(index: Int, promise: Promise) {
        if (index in registeredReceivers.indices) {
            val receiver = registeredReceivers[index]
            context.unregisterReceiver(receiver)
            registeredReceivers.removeAt(index)
            promise.resolve(true)
            logDebug("unregister", "Receiver at index $index unregistered successfully.")
        } else {
            val errorMessage = "Invalid index or no receivers registered."
            logError("unregister", errorMessage)
            promise.reject("UNREGISTER_ERROR", errorMessage)
        }
    }

    /**
     * Register a broadcast receiver
     */
    override fun register(filterName: String, actionNames: String, eventName: String, category: String, promise: Promise) {
        try {
            val filter = IntentFilter(filterName).apply {
                addCategory(if (category.isEmpty()) DEFAULT_CATEGORY else category)
            }
            val actions = actionNames.split(";")
            val receiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    displayScanResult(intent, actions, eventName)
                }
            }

            context.registerReceiver(receiver, filter)
            registeredReceivers.add(receiver)
            promise.resolve(registeredReceivers.indexOf(receiver))
            logDebug("register", "Receiver registered with filter: '$filterName', category: '${filter.categories}'.")
        } catch (exception: Exception) {
            val errorMessage = "Failed to register receiver: ${exception.localizedMessage}"
            logError("register", errorMessage)
            promise.reject("REGISTER_ERROR", errorMessage)
        }
    }

    /**
     * Send a broadcast
     */
    override fun sendBroadcast(actionName: String, key: String, value: String, category: String, promise: Promise) {
        try {
            val intent = Intent(actionName).apply {
                putExtra(key, value)
                addCategory(if (category.isEmpty()) DEFAULT_CATEGORY else category)
            }

            context.sendBroadcast(intent)
            promise.resolve(true)
            logDebug("sendBroadcast", "Broadcast sent: action: '$actionName', key: '$key', value: '$value', category: '${intent.categories}'.")
        } catch (e: Exception) {
            val errorMessage = "Error sending broadcast: ${e.localizedMessage}"
            logError("sendBroadcast", errorMessage)
            promise.reject("SEND_BROADCAST_ERROR", errorMessage)
        }
    }
}
