import Foundation

class BroadcastEvent: HybridBroadcastEventSpec {
    private var registeredReceivers: [String] = [] // List of registered receivers
    private var actionNameList: [String] = [] // List of action names for filtering
    private var currentEventName: String = ""
    private let defaultCategory = "default_category" // Default broadcast category on iOS

    /**
     * Override to return supported event names
     */
    override func supportedEvents() -> [String]! {
        return registeredReceivers
    }

    /**
     * Extract and send event data via broadcasts
     * @param notification Notification containing event data
     */
    @objc func displayScanResult(notification: Notification) {
        var message: [String: String] = [:]

        for actionName in actionNameList {
            if let value = notification.userInfo?[actionName] as? String {
                message[actionName] = value
            } else {
                logDebug(tag: "displayScanResult", message: "Key '\(actionName)' has no data.")
            }
        }

        sendEvent(withName: currentEventName, body: message)
        logDebug(tag: "displayScanResult", message: "Event '\(currentEventName)' sent with data: \(message).")
    }

    /**
     * Unregister a broadcast receiver
     * @param index Index of the receiver to remove
     * @param resolve Promise resolved upon success
     * @param reject Promise rejected upon failure
     */
    @objc(unregister:withResolver:withRejecter:)
    public func unregister(index: Int, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard index >= 0 && index < registeredReceivers.count else {
            let errorMessage = "Invalid index or no registered receivers."
            logError(tag: "unregister", message: errorMessage)
            reject("UNREGISTER_ERROR", errorMessage, nil)
            return
        }

        let receiver = registeredReceivers[index]
        NotificationCenter.default.removeObserver(self, name: NSNotification.Name(receiver), object: nil)
        registeredReceivers.remove(at: index)

        resolve(true)
        logDebug(tag: "unregister", message: "Receiver '\(receiver)' unregistered successfully.")
    }

    /**
     * Register a broadcast receiver
     * @param filterName Name used for filtering the broadcasts
     * @param actionNames Semicolon-separated list of action names to map
     * @param eventName Name of the event to emit
     * @param category Broadcast category (defaults to "default_category")
     * @param resolve Promise containing the index of the registered receiver
     * @param reject Promise rejected upon failure
     */
    @objc(register:withActionNames:withEventName:withCategory:withResolver:withRejecter:)
    public func register(filterName: String, actionNames: String, eventName: String, category: String = "", resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            let notificationName = Notification.Name(filterName + (category.isEmpty ? defaultCategory : category))
            self.actionNameList = actionNames.components(separatedBy: ";")
            self.currentEventName = eventName

            NotificationCenter.default.addObserver(
                self,
                selector: #selector(displayScanResult(notification:)),
                name: notificationName,
                object: nil
            )

            registeredReceivers.append(filterName)
            logDebug(tag: "register", message: "Receiver registered with filter: '\(filterName)', category: '\(category.isEmpty ? defaultCategory : category)'.")
            resolve(registeredReceivers.firstIndex(of: filterName))
        } catch let error {
            let errorMessage = "Failed to register receiver: \(error.localizedDescription)"
            logError(tag: "register", message: errorMessage)
            reject("REGISTER_ERROR", errorMessage, error)
        }
    }

    /**
     * Send a broadcast
     * @param actionName Name of the broadcast intent
     * @param key Key for the data in the broadcast map
     * @param value Value associated with the key in the broadcast
     * @param category Broadcast category (defaults to "default_category")
     * @param resolve Promise resolved upon success
     * @param reject Promise rejected upon failure
     */
    @objc(sendBroadcast:withKey:withValue:withCategory:withResolver:withRejecter:)
    public func sendBroadcast(actionName: String, key: String, value: String, category: String = "", resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            let notificationName = Notification.Name(actionName + (category.isEmpty ? defaultCategory : category))
            let message = [key: value]

            NotificationCenter.default.post(
                name: notificationName,
                object: nil,
                userInfo: message
            )

            resolve(true)
            logDebug(tag: "sendBroadcast", message: "Broadcast sent: action: '\(actionName)', key: '\(key)', value: '\(value)', category: '\(category.isEmpty ? defaultCategory : category)'.")
        } catch let error {
            let errorMessage = "Error sending broadcast: \(error.localizedDescription)"
            logError(tag: "sendBroadcast", message: errorMessage)
            reject("SEND_BROADCAST_ERROR", errorMessage, error)
        }
    }
}
