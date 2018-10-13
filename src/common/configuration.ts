/*---------------------------------------------------------------------------------------------
* Copyright (c) 2018 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { Config } from "@bentley/imodeljs-clients";

/**
 * List of possible backends that simple-viewer-app can use
 */
export const enum UseBackend {
  /** Use local simple-viewer-app backend */
  Local = 0,

  /** Use deployed Navigator backend */
  Navigator = 1,
}

/**
 * Setup configuration for the application
 */
export default function setupEnv() {
  Config.App.merge({
    // Url Discovery Service URL
    imjs_buddi_url: "https://buddi.bentley.com/WebService",

    // Backend which the frontend should use. Default value is UseBackend.Local
    // imjs_backend: UseBackend.Local,

    // -----------------------------------------------------
    // User must set following variables.
    // For more information see  https://git.io/fx8YP (Developer registration)
    // -----------------------------------------------------
    // imjs_test_oidc_client_id     : "<oidc-client-id>",
    // imjs_test_oidc_redirect_path : "<oidc-redirect-path>",
    // imjs_test_project            : "<my-project>",
    // imjs_test_imodel             : "<my-imodel>",
  });
}
