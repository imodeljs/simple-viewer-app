/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { IOidcFrontendClient, AccessToken, OidcClient, UserInfo } from "@bentley/imodeljs-clients";
import { BeEvent, ClientRequestContext } from "@bentley/bentleyjs-core";

export class OidcIOSClient extends OidcClient implements IOidcFrontendClient {
  private _accessToken: AccessToken | undefined;
  public constructor() {
    super();
  }

  public async initialize(): Promise<void> {
    return new Promise<void>((resolve) => {
      (window as any).notifyOidcClient = () => {
        this.reloadInfo();
        this.onUserStateChanged.raiseEvent(this._accessToken);
      };
      resolve();
    });
  }
  private reloadInfo() {
    const settings = window.localStorage.getItem("ios:oidc_info");
    const info = JSON.parse(settings!);
    const startsAt: Date = new Date(info!.expires_at - info!.expires_in);
    const expiresAt: Date = new Date(info!.expires_at);
    const userInfo = UserInfo.fromJson(info.user_info);
    this._accessToken = AccessToken.fromJsonWebTokenString(info.access_token, startsAt, expiresAt, userInfo);
  }

  public async signIn(requestContext: ClientRequestContext): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.startSignIn(requestContext);
      } catch (error) {
        reject(error);
      }

      this.onUserStateChanged.addListener((token: AccessToken | undefined, _message: string) => {
        if (token)
          resolve();
        else
          reject();
      });
    });
  }

  private startSignIn(_requestContext: ClientRequestContext): void {
    (window as any).webkit.messageHandlers.signIn.postMessage("");
  }

  /** Start the sign-out and return a promise that fulfils or rejects when it's complete
   * The call redirects application to postSignoutRedirectUri specified in the configuration
   * when sign-out is complete
   */
  public async signOut(requestContext: ClientRequestContext): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.startSignOut(requestContext);
      } catch (error) {
        reject(error);
      }

      this.onUserStateChanged.addListener((token: AccessToken | undefined) => {
        if (!token)
          resolve();
        else
          reject();
      });
    });
  }

  private startSignOut(_requestContext: ClientRequestContext): void {
    (window as any).webkit.messageHandlers.signOut.postMessage("");
  }

  public async getAccessToken(_requestContext?: ClientRequestContext): Promise<AccessToken> {
    return new Promise<AccessToken>((resolve, reject) => {
      if (this._accessToken)
        resolve(this._accessToken);
      else
        reject("Not signed in");
    });
  }

  /** Set to true if there's a current authorized user or client (in the case of agent applications).
   * Set to true if signed in and the access token has not expired, and false otherwise.
   */
  public get isAuthorized(): boolean {
    return !!this._accessToken;
  }

  /** Set to true if the user has signed in, but the token has expired and requires a refresh */
  public get hasExpired(): boolean {
    return !!this._accessToken;
  }

  /** Set to true if signed in - the accessToken may be active or may have expired and require a refresh */
  public get hasSignedIn(): boolean {
    return !!this._accessToken;
  }

  public dispose(): void {
  }

  public readonly onUserStateChanged = new BeEvent<(token: AccessToken | undefined, message: string) => void>();
}
