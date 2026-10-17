import UIKit
import Capacitor
import HealthKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = SatiBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// Registers Sati's in-app native plugins with the Capacitor bridge.
class SatiBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(SatiHealthPlugin())
    }
}

/// Writes completed meditation sessions to Apple Health as Mindful Minutes (write-only).
@objc(SatiHealthPlugin)
public class SatiHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SatiHealthPlugin"
    public let jsName = "SatiHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveMindfulSession", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()
    private var mindful: HKCategoryType? { HKObjectType.categoryType(forIdentifier: .mindfulSession) }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let type = mindful else {
            call.resolve(["granted": false])
            return
        }
        let share: Set<HKSampleType> = [type]
        store.requestAuthorization(toShare: share, read: nil) { ok, _ in
            call.resolve(["granted": ok && self.store.authorizationStatus(for: type) == .sharingAuthorized])
        }
    }

    @objc func saveMindfulSession(_ call: CAPPluginCall) {
        guard let type = mindful,
              let start = call.getDouble("start"),
              let end = call.getDouble("end"),
              end > start else {
            call.reject("Invalid session")
            return
        }
        guard store.authorizationStatus(for: type) == .sharingAuthorized else {
            call.resolve(["saved": false])
            return
        }
        let sample = HKCategorySample(type: type,
                                      value: HKCategoryValue.notApplicable.rawValue,
                                      start: Date(timeIntervalSince1970: start / 1000),
                                      end: Date(timeIntervalSince1970: end / 1000))
        store.save(sample) { ok, error in
            if ok { call.resolve(["saved": true]) } else { call.reject(error?.localizedDescription ?? "Could not save to Health") }
        }
    }
}
