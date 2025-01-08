export default class AppInstall {
  constructor();

  /**
   * Sets the custom URI scheme for the app.
   * @param scheme The URI scheme to set (e.g., 'yourapp://').
   */
  setScheme(scheme: string): void;

  /**
   * Sets the App ID for the store AppStore.
   * @param appID The App Store ID of the app.
   */
  setAppID(appID: string): void;

  /**
   * Sets the timeout for how long the package waits to detect if the app is already installed.
   * @param timeout The timeout in ms.
   */
  setTimeout(timeout: number): void;

  /**
   * Attempts to determine the operating system of the device.
   * @returns Returns 'Android', 'iOS', or 'unknown' based on the user agent.
   */
  getOperatingSystem(): 'Android' | 'iOS' | 'unknown';

  /**
   * Attempts to launch the app based on the operating system.
   * Returns a string indicating the result or platform.
   * @returns 'android', 'iOS', or 'unknown' based on the launch method.
   */
  launchApp(): 'android' | 'iOS' | 'unknown';

  /**
   * Specifically handles launching the app for Android devices.
   * Changes the window location to an intent URL for Android.
   * @returns Returns 'android'.
   */
  private launchAppAndroid(): 'android';

  /**
   * Specifically handles launching the app for iOS devices.
   * Initially tries to open the app via scheme, if fails, redirects to the App Store.
   * @returns Returns 'iOS'.
   */
  private launchAppiOS(): 'iOS';
}
