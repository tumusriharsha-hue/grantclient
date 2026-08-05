# Grant source compliance

Review date: 2026-08-05

## Enabled: Simpler.Grants.gov

- Owner: U.S. federal government
- Retrieval method: documented official REST API
- Endpoint: `POST https://api.simpler.grants.gov/v1/opportunities/search`
- Documentation: https://wiki.simpler.grants.gov/product/api/search-opportunities
- Developer portal: https://simpler.grants.gov/developers
- Authentication: issued API key in `X-API-Key`
- Published limit: 60 requests/minute and 10,000/day per key
- Pipeline limit: one request every 1.1 seconds, sequential pagination
- User agent: `GrantClient-GrantIngestion/1.0 (+https://grantclient.com; grants@grantclient.com)`
- Robots: the API host disallows general crawling and allows `/docs`; the adapter uses the explicitly documented API and does not crawl HTML.
- Status: enabled

The adapter requests posted grants and cooperative agreements where the official applicant-type data includes nonprofit categories. It does not retrieve attachments or crawl linked agency sites. The official API record is the verification authority.

## Disabled: California Grants Portal

- Owner: California State Library
- Retrieval method: official downloadable public-domain dataset and CKAN API
- Dataset: https://lab.data.ca.gov/dataset/california-grants-portal
- Portal FAQ confirming API availability: https://www.grants.ca.gov/faq/
- Robots: `https://data.ca.gov/robots.txt` currently disallows `/api/`
- Dataset contents: grants and loans for nonprofits, businesses, individuals, public agencies, and tribal governments
- Status: disabled pending written clarification

Although the State advertises the API and downloadable dataset, GrantClient's stricter compliance rule treats the robots conflict conservatively. The adapter remains implemented and testable but returns no records while disabled. If written authorization clarifies automated API retrieval, update the compliance review date, robots assessment, and `enabled` value before use.

## Excluded source classes

- private or paywalled grant directories;
- sites requiring authentication, CAPTCHA, anti-bot bypass, or browser impersonation;
- unrestricted web search results;
- funder pages without explicit automated-access permission;
- current synthetic local JSON generation;
- personal-information datasets;
- scholarships, loans, investments, contracts, procurement, individual-only, and business-only opportunities.

## Adding a source

A source cannot be enabled until its official API, dataset, RSS feed, or documented automated access has been reviewed; robots and applicable usage terms have been recorded; request limits are configured; fixture tests exist; and nonprofit eligibility can be proven from source fields.
