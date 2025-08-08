import { createCookieSessionStorage } from "react-router";
import env from "./lib/.server/env";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "__cg_airdrop_session",

        // all of these are optional
        domain: "embed.commonground.cg",
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 21600, // 6 hours
        path: env.VITE_URL_PREFIX,
        sameSite: "lax",
        secrets: [env.COOKIE_SECRET],
        secure: true,
      },
    }
  );

export { getSession, commitSession, destroySession };
