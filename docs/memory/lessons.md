# Lessons — BreatheWise

- [L-001] Type Decoupling → `typeof fetch` contains Node/DOM specific properties like `.preconnect`. Using `type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>` ensures clean, portable dependency injection across tests and runtime.
- [L-002] Test Isolation → Harness tests modifying disk state (`state.json`, `budgets.json`) must restore the original files via `@pytest.fixture(autouse=True)` to prevent cascading gate failures.
- [L-003] Output Coercion → Markdown code fences (````json ... ````) from LLMs must always be stripped with a resilient regex prior to `JSON.parse` to avoid avoidable `MODEL_BAD_JSON` exceptions.
