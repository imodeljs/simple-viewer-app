/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { page } from "../setupTests";

describe("Sign in view", () => {
  it("renders initially", async () => {
    await page.waitForSelector(".signin-button");

    // Verify that welcome message exists
    await page.waitForSelector(".prompt");

    // Verify that "Register" link exists
    await page.waitForSelector(".signin-register-div a");

    // Verify that "Work offline" link exists
    await page.waitForSelector(".signin-offline");
  });
});
