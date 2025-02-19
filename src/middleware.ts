import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";


// TODO: Low priority: Middleware handles auth redirect
export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|zh)/:path*"],
};
