export const THEME_STORAGE_KEY = "admin-theme";

export const THEME_EVENT = "admin-theme-change";

/**
 * Runs before hydration and first paint to apply the admin theme class without
 * a flash. Only /admin routes activate dark mode; the public site is always
 * light, so non-admin paths explicitly clear the class.
 */
export const ADMIN_THEME_SCRIPT = `(function(){try{var p=window.location.pathname;var a=p==="/admin"||p.indexOf("/admin/")===0;var r=document.documentElement;if(!a){r.classList.remove("dark");r.style.colorScheme="light";return;}var s=window.localStorage.getItem("admin-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      id="admin-theme-init"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }}
    />
  );
}
