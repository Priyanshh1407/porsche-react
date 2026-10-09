// TEST-02: a test that finishes without asserting anything fails. The original api.test.js had
// a test that returned early when its setup was missing and "passed" without checking anything.
beforeEach(() => {
    expect.hasAssertions();
});
