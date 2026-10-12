// Stops the embedded test database started by global-setup.cjs (a no-op for an external one).
module.exports = async () => {
    if (globalThis.__TEST_DB__) await globalThis.__TEST_DB__.stop();
};
