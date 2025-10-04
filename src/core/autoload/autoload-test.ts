/** Eagerly loads all test-double-like files for IoC container autoloading in the test execution context */
import.meta.glob(
  [
    "../../**/*.dummy.ts",
    "../../**/*.stub.ts",
    "../../**/*.mock.ts",
    "../../**/*.double.ts",
    "../../**/*.spy.ts",
    "../../**/*.fake.ts",
  ],
  {
    eager: true,
  },
);
