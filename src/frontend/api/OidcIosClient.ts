/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { IOidcFrontendClient, AccessToken, OidcClient, UserInfo} from "@bentley/imodeljs-clients";
import { BeEvent } from "@bentley/bentleyjs-core";

export class OidcIOSClient extends OidcClient implements IOidcFrontendClient {
    private _accessToken: AccessToken | undefined;
    public constructor() {
      super();
    }
    public initialize(): Promise<void> {
     return new Promise<void>((resolve) => {
        (window as any).notifyOidcClient = () => {
        this.realodInfo();
        this.onUserStateChanged.raiseEvent(this._accessToken);
       };
        resolve();
      });
    }
   private realodInfo() {
    const settings = window.localStorage.getItem("ios:oidc_info");
    const info = JSON.parse(settings!);
    const startsAt: Date = new Date(info!.expires_at - info!.expires_in);
    const expiresAt: Date = new Date(info!.expires_at);
    const userInfo = UserInfo.fromJson(info.user_info);
    this._accessToken = AccessToken.fromJsonWebTokenString(info.access_token, startsAt, expiresAt, userInfo);
   }
   public signIn(): void {
    (window as any).webkit.messageHandlers.signIn.postMessage("");
    }

    public signOut(): void {
      (window as any).webkit.messageHandlers.signOut.postMessage("");
    }

    public getAccessToken(): Promise<AccessToken | undefined> {
        return new Promise<AccessToken | undefined> ((resolve) => {
          resolve(this._accessToken);
        });
     }

    public dispose(): void {
    }

    public readonly onUserStateChanged = new BeEvent<(token: AccessToken | undefined) => void>();
  }
