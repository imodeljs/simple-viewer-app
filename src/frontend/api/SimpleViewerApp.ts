/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { ActivityLoggingContext, Guid } from "@bentley/bentleyjs-core";
import { BentleyCloudRpcParams, RpcConfiguration } from "@bentley/imodeljs-common";
import { Config, AccessToken, UrlDiscoveryClient } from "@bentley/imodeljs-clients";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { UseBackend } from "../../common/configuration";
import OidcClient from "./OidcClient";
import initLogging from "./logging";
import initRpc from "./rpc";

// initialize logging
initLogging();

// subclass of IModelApp needed to use imodeljs-frontend
export class SimpleViewerApp extends IModelApp {
  private static _rpcConfig: RpcConfiguration;
  private static _oidcClient: OidcClient;
  private static _isReady: Promise<void>;

  public static get ready(): Promise<void> { return this._isReady; }

  public static get oidc() { return this._oidcClient; }

  protected static onStartup() {
    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize localization for the app
    initPromises.push(IModelApp.i18n.registerNamespace("SimpleViewer").readFinished);

    // configure a CORS proxy in development mode.
    // The Bentley services do not support CORS requests from localhost, and therefore we need to configure
    // a proxy allow requests from the code running in the browser. In an actual deployment, this is not
    // typically an issue if the application is in the Bentley domain, but if it is not, it's necessary to ensure
    // that the service supports CORS requests. See https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    // for more details.
    if (Config.App.getNumber("imjs_backend", UseBackend.Local) === UseBackend.Local && process.env.NODE_ENV === "development")
      Config.App.set("imjs_dev_cors_proxy_server", `http://${window.location.hostname}:${process.env.CORS_PROXY_PORT}`);

    // initialize UiCore
    initPromises.push(UiCore.initialize(this.i18n));

    // initialize UiComponents
    initPromises.push(UiComponents.initialize(this.i18n));

    // initialize Presentation
    Presentation.initialize({
      activeLocale: IModelApp.i18n.languageList()[0],
    });

    // create an OIDC client that helps with the sign-in / sign-out process
    this._oidcClient = new OidcClient();
    this._oidcClient.onUserStateChanged.addListener(this._onUserStateChanged);
    initPromises.push(this._oidcClient.ready);

    // initialize RPC communication
    initPromises.push(this.getConnectionInfo().then((rpcParams) => {
      this._rpcConfig = initRpc(rpcParams);
      if (this._oidcClient.accessToken)
        this._rpcConfig.applicationAuthorizationValue = this._oidcClient.accessToken.toTokenString();
    }));

    // the app is ready when all initialization promises are fulfilled
    this._isReady = Promise.all(initPromises).then(() => {});
  }

  public static shutdown() {
    this._oidcClient.onUserStateChanged.removeListener(this._onUserStateChanged);
    this._oidcClient.dispose();
    IModelApp.shutdown();
  }

  private static _onUserStateChanged = (accessToken: AccessToken | undefined) => {
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
