/** Eagerly loads all *.al.ts files for IoC container autoloading in the app execution context */
import.meta.glob(["../../**/*.al.ts"], {
  eager: true,
});
