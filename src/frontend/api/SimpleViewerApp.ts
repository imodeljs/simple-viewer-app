/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { ActivityLoggingContext, Guid } from "@bentley/bentleyjs-core";
import { BentleyCloudRpcParams, RpcConfiguration } from "@bentley/imodeljs-common";
import { Config, AccessToken, UrlDiscoveryClient, OidcFrontendClientConfiguration, IOidcFrontendClient } from "@bentley/imodeljs-clients";
import { IModelApp, OidcBrowserClient } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { UseBackend } from "../../common/configuration";
import initLogging from "./logging";
import initRpc from "./rpc";

// initialize logging
initLogging();

// subclass of IModelApp needed to use imodeljs-frontend
export class SimpleViewerApp extends IModelApp {
  private static _rpcConfig: RpcConfiguration;
  private static _isReady: Promise<void>;
  private static _oidcClient: IOidcFrontendClient;

  public static get oidcClient() { return this._oidcClient; }

  public static get ready(): Promise<void> { return this._isReady; }

  protected static onStartup() {
    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize localization for the app
    initPromises.push(IModelApp.i18n.registerNamespace("SimpleViewer").readFinished);

    // initialize UiCore
    initPromises.push(UiCore.initialize(this.i18n));

    // initialize UiComponents
    initPromises.push(UiComponents.initialize(this.i18n));

    // initialize Presentation
    Presentation.initialize({
      activeLocale: IModelApp.i18n.languageList()[0],
    });

    // initialize RPC communication
    initPromises.push(SimpleViewerApp.initializeRpc());

    // initialize OIDC
    initPromises.push(SimpleViewerApp.initializeOidc());

    // the app is ready when all initialization promises are fulfilled
    this._isReady = Promise.all(initPromises).then(() => { });
  }

  private static async initializeRpc(): Promise<void> {
    const rpcParams = await this.getConnectionInfo();
    this._rpcConfig = initRpc(rpcParams);
  }

  private static async initializeOidc() {
    const clientId = Config.App.get("imjs_browser_test_client_id");
    const redirectUri = Config.App.getString("imjs_browser_test_redirect_uri"); // must be set in config
    const scope = Config.App.getString("imjs_browser_test_scope");
    const oidcConfig: OidcFrontendClientConfiguration = { clientId, redirectUri, scope };

    // create an OIDC client that helps with the sign-in / sign-out process
    this._oidcClient = new OidcBrowserClient(oidcConfig);
    await this._oidcClient.initialize(new ActivityLoggingContext(Guid.createValue()));
    this._oidcClient.onUserStateChanged.addListener(this._onUserStateChanged);

    const accessToken: AccessToken | undefined = await this._oidcClient.getAccessToken(new ActivityLoggingContext(Guid.createValue()));
    if (accessToken)
      this._rpcConfig.applicationAuthorizationValue = accessToken.toTokenString();
  }

  public static shutdown() {
    this._oidcClient.onUserStateChanged.removeListener(this._onUserStateChanged);
    this._oidcClient.dispose();
    IModelApp.shutdown();
  }

  private static _onUserStateChanged = (accessToken: AccessToken | undefined) => {
    // tslint:disable-next-line:no-floating-promises
    SimpleViewerApp.ready.then(() => {
      SimpleViewerApp._rpcConfig.applicationAuthorizationValue = accessToken ? accessToken.toTokenString() : "";
    });
  }

  private static async getConnectionInfo(): Promise<BentleyCloudRpcParams | undefined> {
    const usedBackend = Config.App.getNumber("imjs_backend", UseBackend.Local);

    if (usedBackend === UseBackend.Navigator) {
      const urlClient = new UrlDiscoveryClient();
      const orchestratorUrl = await urlClient.discoverUrl(new ActivityLoggingContext(Guid.createValue()), "iModelJsOrchestrator.SF", undefined);
      return { info: { title: "navigator-backend", version: "v1.0" }, uriPrefix: orchestratorUrl };
    }

    if (usedBackend === UseBackend.Local)
      return undefined;

    throw new Error(`Invalid backend "${usedBackend}" specified in configuration`);
  }
}
