# Coverage

The content map for Technicals. Each module lists its subtopics as checkboxes, a target card count and a status line. Tick a subtopic once cards cover it well. To resume in a new session, say "Continue from COVERAGE.md".

- Targets are approximate. Covering every subtopic matters more than hitting the number.
- Status values: `planned`, `seeded` (sample cards only), `in progress`, `complete`.
- `node tools/validate.js --update-coverage` refreshes the Written and Classic counts, the drill checkboxes and the summary table. Status and subtopic ticks are edited by hand.

## Where things stand

- Phase 1 (plan) and Phase 2 (app, sample deck, validator, first deploy) are done. Live at https://danitookoff.github.io/technicals/.
- Owner feedback on the sample (2026-09-23): keep the current style (likes dark mode), keep answer length the same, difficulty is the right starting point.
- **Phase 3 (full deck) is in progress.** Content is written in parallel waves, one module per writer, following WRITING.md. After each wave: validate, spot-check, tick subtopics, update counts, bump, commit, push.
  - Wave A (done): `re-basics`, `re-noi`, `re-val`, `re-returns`, `re-debt`, `hotel-metrics`, `hotel-usali`, `hotel-val`, plus every real estate and hotel drill.
  - Wave B (done): `re-leases`, `re-deals`, `re-acq`, `re-am`, `re-dev`, `re-market`, `re-acct`, `re-model`, `hotel-basics`, `hotel-agreements`. Real estate is complete.
  - Wave C (done): `hotel-capex`, `hotel-debt`, `hotel-rm`, `hotel-am`, `ib-acct`, `ib-walk`, `ib-acct-adv`, `ib-ratios`, `ib-ev`, `ib-val`, plus the remaining IB drills. Hotels and all 53 drills are complete.
  - Wave D (in progress): done so far `ib-precedents`, `ib-wacc`, `ib-comps`, `ib-credit`, `ib-ma`, `ib-lbo`; being written `ib-dcf`, `ib-process`, `ib-rx`, `ib-sectors`, `ib-model`.
- **Phase 4 (audit) has started on real estate and hotels**, which are final: most-asked questions checked (gaps filled: opportunity zones, LIHTC, rent regulation), legal wording reviewed, math re-verified on a random 10%.
- Then Phase 4 (audit against the most-asked questions, merge duplicates, re-verify the math on a random 10% of cards, fix flags) and Phase 5 (final CLAUDE.md and README, coverage summary).
- Next free ID in a module = highest existing number + 1. Never renumber or reuse an ID.

<!-- summary:start -->
| Track | Modules | Target | Written | Classic | Drills built |
|---|---:|---:|---:|---:|---:|
| IB | 17 | 560 | 425 | 115 | 18 of 18 |
| Real estate | 13 | 440 | 453 | 118 | 22 of 22 |
| Hotels | 9 | 250 | 251 | 66 | 13 of 13 |
| **Total** | **39** | **1250** | **1129** | **299** | **53 of 53** |
<!-- summary:end -->

---

## IB

### `ib-acct` Accounting and the three statements
Target: 60 · Written: 60 · Classic: 13 · Status: complete

- [x] What the income statement, balance sheet and cash flow statement each show
- [x] How the three statements link (net income, D&A, working capital, capex, debt, cash, retained earnings)
- [x] Revenue recognition basics under ASC 606 (five steps; point in time vs over time)
- [x] Gross vs net revenue (principal vs agent)
- [x] COGS, gross profit and operating expenses
- [x] EBITDA vs EBIT vs net income, and what each is used for
- [x] Non-recurring items and how to treat them
- [x] Basic vs diluted EPS
- [x] Balance sheet structure: current vs non-current; assets = liabilities + equity
- [x] Working-capital accounts (AR, inventory, prepaids, AP, accrued expenses, deferred revenue); operating working capital excludes cash and debt
- [x] PP&E, depreciation and accumulated depreciation
- [x] Intangible assets and goodwill: where they come from
- [x] Debt accounts: revolver, current portion, long-term debt
- [x] Equity accounts: common stock and APIC, retained earnings, treasury stock, AOCI
- [x] Contra accounts (allowance for doubtful accounts, accumulated depreciation)
- [x] The indirect cash flow statement: operating, investing, financing
- [x] Non-cash add-backs (D&A, SBC, impairments, deferred taxes, gains and losses)
- [x] Sign logic of working-capital changes on the cash flow statement
- [x] Accrual vs cash accounting
- [x] Inventory methods: FIFO vs LIFO vs weighted average, in rising and falling prices; LIFO not allowed under IFRS
- [x] Where D&A hides (inside COGS and opex) and why it matters for EBITDA
- [x] Capitalizing vs expensing, and the effect on each statement
- [x] Prepaid expenses, accrued expenses and deferred revenue
- [x] FCF vs unlevered FCF vs levered FCF
- [x] The "only one statement" and "only two statements" questions
- [x] Profitable but cash-poor, and cash-rich but unprofitable
- [x] Interest and dividends on the cash flow statement: US GAAP vs IFRS classification
- [x] Gains and losses on asset sales
- [x] The statement of shareholders' equity

### `ib-walk` Walk-throughs
Target: 35 · Written: 35 · Classic: 10 · Status: complete

State the tax rate on every card (default 25%) and use the `threeStatement` visual.

- [x] Depreciation up
- [x] Inventory bought with cash
- [x] Inventory bought on credit
- [x] Inventory write-down
- [x] Revenue booked on credit, then AR collected
- [x] Prepaid expense paid, then expensed
- [x] Deferred revenue received, then earned
- [x] Bonus accrued, then paid
- [x] Stock-based compensation (and the deferred-tax nuance)
- [x] Debt raised, then interest paid
- [x] Debt repaid
- [x] PIK interest
- [x] Capex
- [x] Asset sold at a gain
- [x] Asset sold at a loss
- [x] PP&E impairment
- [x] Goodwill impairment (usually not tax-deductible)
- [x] Dividends
- [x] Share buybacks
- [x] Equity issuance
- [x] Operating lease payment under ASC 842
- [x] Finance lease payment under ASC 842
- [x] Deferred tax liability from accelerated tax depreciation
- [x] Using an NOL
- [x] AP paid down
- [x] Bad debt written off
- [x] Convertible bond converted into equity
- [x] Unrealized gain on an equity investment
- [x] Two-step walk-throughs (buy then sell inventory; accrue then pay)

### `ib-acct-adv` Advanced accounting
Target: 35 · Written: 35 · Classic: 10 · Status: complete

- [x] Deferred tax liabilities: book vs tax depreciation
- [x] Deferred tax assets: NOLs, accruals, stock comp
- [x] Valuation allowances
- [x] NOL mechanics: carryforwards and usage limits (post-2017 US rules)
- [x] Leases under ASC 842: operating vs finance classification and presentation
- [x] IFRS 16: one lease model and its effect on EBITDA, EBIT and debt
- [x] Leases and EV/EBITDA consistency (EBITDAR)
- [x] Stock-based compensation: expense, add-back, dilution, tax timing
- [x] Goodwill and intangibles: creation, amortization, impairment testing
- [x] Equity method vs consolidation (rough 20% and 50% thresholds)
- [x] Noncontrolling interest on the income statement and balance sheet
- [x] Debt accounting: OID, issuance costs, PIK
- [x] Convertible bonds: accounting and dilution (if-converted)
- [x] Preferred stock: dividends, EPS, liquidation preference
- [x] Pensions: funded status and where they show up
- [x] Adjusted EBITDA and normalization, and its red flags
- [x] Capitalized software and R&D (US GAAP vs IFRS development costs)
- [x] Contingent consideration (earnouts)
- [x] Discontinued operations
- [x] IFRS vs US GAAP: impairment reversals, revaluation model
- [x] Foreign currency translation basics (CTA in AOCI)

### `ib-ratios` Financial statement analysis
Target: 20 · Written: 21 · Classic: 6 · Status: complete

- [x] Gross, EBITDA, EBIT and net margins
- [x] ROE and the DuPont breakdown
- [x] ROA and ROIC; ROIC vs WACC and value creation
- [x] DSO, DIO, DPO and the cash conversion cycle
- [x] Liquidity ratios: current and quick
- [x] Leverage: debt/EBITDA, net debt/EBITDA, debt/capital
- [x] Coverage: EBITDA/interest, (EBITDA − capex)/interest, fixed-charge coverage
- [x] Asset turnover and operating leverage
- [x] Earnings-quality red flags (AR outgrowing revenue, capitalized costs, one-off gains, growing adjustments)

### `ib-ev` Enterprise and equity value
Target: 40 · Written: 40 · Classic: 10 · Status: complete

- [x] Definitions, and why EV is capital-structure neutral
- [x] Equity value vs market cap vs fully diluted equity value
- [x] The bridge item by item: debt, preferred, NCI, leases, pensions, cash, non-operating assets, equity investments
- [x] Why add NCI and subtract equity investments (consistency with EBITDA)
- [x] Cash: why subtract it; trapped and minimum cash
- [x] Leases in the bridge (practice varies)
- [x] Unfunded pensions and other debt-like items
- [x] NOLs in the bridge
- [x] Diluted shares: treasury stock method
- [x] RSUs, PSUs and warrants
- [x] Convertibles: if-converted vs treated as debt
- [x] Which transactions change EV vs equity value
- [x] Negative EV and negative equity value
- [x] Matching numerators to denominators
- [x] EV/EBITDA vs P/E vs EV/revenue: when each fits
- [x] Market vs book values
- [x] Implied share price from EV

### `ib-val` Valuation overview
Target: 25 · Written: 26 · Classic: 7 · Status: complete

- [x] The methods: comps, precedents, DCF, LBO, sum-of-the-parts, liquidation, dividend discount, NAV
- [x] Intrinsic vs relative valuation
- [x] When each method fits
- [x] The football field
- [x] Which methods usually come out highest or lowest, and why
- [x] Valuing unprofitable or early-stage companies
- [x] Valuing cyclical companies (normalized, mid-cycle earnings)
- [x] Valuing distressed companies
- [x] Sum-of-the-parts and conglomerate discounts
- [x] Liquidation value
- [x] Replacement cost

### `ib-comps` Trading comps
Target: 25 · Written: 25 · Classic: 7 · Status: complete

- [x] Choosing peers (business model, size, growth, margins, geography)
- [x] LTM and calendarization
- [x] Normalizing one-off items
- [x] Choosing multiples (EV/EBITDA, EV/EBIT, P/E, EV/revenue, PEG, sector metrics)
- [x] LTM vs forward multiples
- [x] Mean vs median; outliers
- [x] Applying the multiples to the target
- [x] Why a company trades at a premium or discount
- [x] Negative earnings in comps
- [x] Spreading comps in practice

### `ib-precedents` Precedent transactions
Target: 15 · Written: 16 · Classic: 4 · Status: complete

- [x] Selecting deals (size, sector, date, buyer type)
- [x] Control premiums and premiums-paid analysis
- [x] Synergies built into the price
- [x] Why precedents usually run higher than comps
- [x] Limitations (stale deals, different markets, deal-specific terms)

### `ib-dcf` DCF
Target: 55 · Written: 2 · Classic: 2 · Status: seeded

- [x] The steps of a DCF
- [ ] Projection length
- [ ] Building unlevered FCF, and why it's unlevered
- [ ] Why D&A is added back and capex subtracted
- [ ] Mid-year convention
- [ ] Stub periods
- [x] Terminal value: Gordon growth vs exit multiple
- [x] Implied exit multiple and implied growth cross-checks
- [ ] Discounting terminal value (including under the mid-year convention)
- [ ] Terminal value's share of total value
- [ ] Normalizing the terminal year (capex vs D&A, working capital, margins)
- [ ] Sensitivity tables
- [ ] Levered DCF: FCFE and cost of equity
- [ ] NOLs in a DCF
- [ ] Stock-based compensation in a DCF (practice varies)
- [ ] Companies with negative cash flow
- [ ] Which inputs move value most
- [ ] What-ifs: growth up 1%, discount rate up 1%, more debt, capex changes
- [ ] Adjusted present value (APV) basics
- [ ] DCF limitations

### `ib-wacc` Cost of capital
Target: 30 · Written: 30 · Classic: 9 · Status: complete

- [x] What WACC represents and how to calculate it
- [x] Weights: target vs current structure; market values
- [x] CAPM: risk-free rate, beta, equity risk premium
- [x] Size and country risk premiums
- [x] Levered vs unlevered beta; relevering
- [x] Where betas come from (regression, adjusted beta, peer betas)
- [x] After-tax cost of debt; yield vs coupon
- [x] Cost of preferred
- [x] How leverage changes WACC; optimal capital structure
- [x] Why equity costs more than debt
- [x] WACC for a private company
- [x] Cost of debt without traded debt

### `ib-lbo` LBO
Target: 55 · Written: 55 · Classic: 15 · Status: complete

- [x] What an LBO is and why leverage lifts returns
- [x] Ideal LBO candidates
- [x] The steps of an LBO model
- [x] Sources and uses
- [x] Debt tranches: revolver, term loans A and B, senior secured and unsecured notes, subordinated notes, high yield, mezzanine, PIK, seller notes, unitranche
- [x] Maintenance vs incurrence covenants
- [x] Cash sweeps and optional prepayment
- [x] Returns drivers: EBITDA growth, multiple expansion, debt paydown
- [x] Returns attribution
- [x] IRR vs MOIC and the rule-of-thumb table
- [x] Paper LBOs
- [x] Dividend recaps
- [x] Management rollover and option pools
- [x] Transaction fees vs financing fees
- [x] Interest circularity
- [x] Exit assumptions and exit routes
- [x] Hold-period effects on IRR and MOIC
- [x] The LBO as a valuation floor; solving for the max price at a target IRR
- [x] Strategic vs financial buyers
- [x] Add-on acquisitions and multiple arbitrage
- [x] Minimum cash and the revolver

### `ib-ma` M&A and merger models
Target: 50 · Written: 50 · Classic: 14 · Status: complete

- [x] Why companies buy
- [x] Revenue vs cost synergies and how to value them
- [x] Accretion/dilution step by step
- [x] Cash vs stock vs debt consideration
- [x] Cost of funds vs earnings yield shortcut
- [x] Break-even synergies
- [x] Purchase price allocation: write-ups, new DTLs, goodwill
- [x] Stock vs asset deals; 338(h)(10) and the step-up
- [x] NOLs after a deal (Section 382)
- [x] Exchange ratios: fixed ratio vs fixed price; collars
- [x] Contribution analysis
- [x] Pro forma ownership
- [x] Earnouts
- [x] Break fees and reverse break fees
- [x] Tender offers vs mergers
- [x] Hostile takeovers and defenses
- [x] Fairness opinions
- [x] Why accretion isn't value creation
- [x] Divestitures: spin-offs, carve-outs, split-offs

### `ib-process` Deal process and ECM
Target: 25 · Written: 0 · Classic: 0 · Status: planned

- [ ] Sell-side process: teaser, NDA, CIM, IOIs, management presentations, data room, LOI, purchase agreement, signing to close
- [ ] Broad vs targeted auctions; negotiated sales
- [ ] Buy-side mandates
- [ ] Purchase agreement terms: reps and warranties, MAC, go-shop vs no-shop
- [ ] Purchase price adjustments: working-capital peg; locked box vs completion accounts
- [ ] IPO process: S-1, roadshow, bookbuilding, pricing, greenshoe, lock-ups
- [ ] Follow-on offerings
- [ ] Convertibles: why issue them; conversion premium
- [ ] SPACs and direct listings (brief)
- [ ] Antitrust review basics (HSR)

### `ib-credit` Debt and leveraged finance
Target: 30 · Written: 30 · Classic: 8 · Status: complete

- [x] Credit metrics and ratings (investment grade vs high yield)
- [x] Secured vs unsecured, and priority
- [x] Bonds vs loans
- [x] Fixed vs floating (SOFR)
- [x] The price–yield relationship; duration and convexity basics
- [x] Yield to maturity, yield to worst, current yield
- [x] Spreads
- [x] Call protection: non-call periods, make-whole, call schedules
- [x] OID
- [x] Refinancing analysis
- [x] Covenant packages: maintenance, incurrence, covenant-lite, baskets
- [x] Recovery analysis
- [x] Asset-based lending and the borrowing base

### `ib-rx` Restructuring basics
Target: 15 · Written: 0 · Classic: 0 · Status: planned

- [ ] Chapter 11 vs Chapter 7
- [ ] Absolute priority rule
- [ ] DIP financing
- [ ] Debt-for-equity swaps
- [ ] The fulcrum security
- [ ] Distressed exchanges
- [ ] 363 sales
- [ ] Prepackaged vs pre-negotiated vs free-fall filings
- [ ] Plan of reorganization and cramdown
- [ ] Liability management: uptiers and drop-downs (brief)

### `ib-sectors` Sector-specific valuation
Target: 25 · Written: 0 · Classic: 0 · Status: planned

- [ ] Banks: P/BV, P/TBV, P/E, dividend discount; why EV doesn't work
- [ ] Bank metrics: NIM, efficiency ratio, CET1, ROTCE
- [ ] Insurance: combined ratio, float, P/BV
- [ ] REITs: FFO, AFFO, NAV
- [ ] Energy: EV/EBITDAX, reserves, NAV
- [ ] Software: ARR, net revenue retention, rule of 40, CAC payback
- [ ] Retail: same-store sales, EBITDAR, sales per SF
- [ ] Hotels from the corporate side: RevPAR, EBITDAR, asset-light vs owners
- [ ] Healthcare: pipelines and risk-adjusted NPV, payor mix
- [ ] Industrials: backlog, book-to-bill
- [ ] Utilities: rate base and allowed ROE

### `ib-model` Modeling mechanics and Excel
Target: 20 · Written: 0 · Classic: 0 · Status: planned

- [ ] Three-statement build order
- [ ] The revolver as the plug
- [ ] Circular references and circuit breakers
- [ ] Tracking down an unbalanced balance sheet
- [ ] Projecting working capital
- [ ] Debt schedules
- [ ] Formatting conventions: blue inputs, black formulas, green links
- [ ] NPV vs XNPV; IRR vs XIRR
- [ ] PMT and IPMT
- [ ] SUMIFS, INDEX/MATCH, XLOOKUP
- [ ] Data tables
- [ ] How to run a timed modeling test

---

## Real estate

### `re-basics` Foundations
Target: 30 · Written: 30 · Classic: 9 · Status: complete

- [x] Office: what drives it
- [x] Multifamily: what drives it
- [x] Industrial: what drives it
- [x] Retail: what drives it
- [x] Hotels as a property type
- [x] Self-storage
- [x] Senior and student housing
- [x] Life science
- [x] Data centers
- [x] Medical office
- [x] Single-family rental
- [x] Fee simple vs leasehold and ground leases
- [x] Building classes (A, B, C)
- [x] Core, core-plus, value-add and opportunistic: risk, leverage, returns
- [x] How real estate differs from corporate finance (NOI vs EBITDA, cap rates vs multiples)
- [x] Who does what: sponsor, LP, GP, operator, property manager, asset manager, broker, lender, REIT, fund
- [x] Asset vs property vs portfolio management vs acquisitions
- [x] How interest rates affect real estate values
- [x] Stabilized vs non-stabilized assets
- [x] Why investors own real estate (income, inflation protection, diversification)

### `re-leases` Leases and rent rolls
Target: 45 · Written: 48 · Classic: 12 · Status: complete

- [x] Gross, modified gross, net and NNN leases
- [x] Base rent and escalations (fixed, CPI, steps)
- [x] Free rent
- [x] TI allowances
- [x] Leasing commissions
- [x] Renewal, expansion and termination options
- [x] Recoveries: CAM and pro-rata share
- [x] Base years and expense stops
- [x] Gross-ups, caps and CAM reconciliations
- [x] Percentage rent and breakpoints
- [x] Co-tenancy
- [x] Estoppels and SNDAs
- [x] WALT and rollover schedules
- [x] In-place vs market rent: mark-to-market and loss-to-lease
- [x] Tenant credit and concentration
- [x] Net effective rent
- [x] Market leasing assumptions: renewal probability, downtime, new vs renewal TI/LC
- [x] Multifamily: unit mix, concessions, physical vs economic occupancy, other income, turnover
- [x] Office: rentable vs usable area and the load factor
- [x] Retail: sales per SF, occupancy cost, anchors
- [x] Industrial basics: clear height, loading, bulk vs flex
- [x] Security deposits and letters of credit
- [x] Assignment, subletting and holdover
- [x] Radius restrictions, exclusives, go-dark and kick-out clauses
- [x] Lease abstracts

### `re-noi` Operating statement and NOI
Target: 35 · Written: 35 · Classic: 8 · Status: complete

- [x] The build from GPR through vacancy and credit loss, concessions and other income to EGI
- [x] Operating expenses to NOI
- [x] Below NOI: capex, reserves, TI/LC, cash flow before debt service
- [x] Debt service and levered cash flow
- [x] What sits above and below NOI, and why
- [x] Controllable vs non-controllable expenses
- [x] T-12, annualized T-3, budget and pro forma
- [x] Buyer normalizations: tax reassessment on sale, insurance, market management fee, one-time items
- [x] Expense ratios; per-unit and per-SF benchmarks
- [x] Operating leverage
- [x] Management fees as a share of EGI
- [x] Replacement reserves
- [x] In-place vs stabilized vs mark-to-market NOI
- [x] Bad debt and delinquency

### `re-val` Valuation
Target: 40 · Written: 41 · Classic: 12 · Status: complete

- [x] Direct capitalization
- [x] What drives cap rates
- [x] Cap rate ≈ discount rate − growth
- [x] Going-in vs exit cap, and why exit is usually higher
- [x] Property DCF: hold period, reversion, discount rate
- [x] Reversion on forward NOI, net of selling costs
- [x] The three appraisal approaches: income, sales comparison, cost
- [x] Price per SF, unit or key vs replacement cost
- [x] Land value and highest and best use
- [x] Sensitivities (exit cap, rent growth, vacancy)
- [x] REIT valuation: FFO, AFFO, NAV, implied cap rate, P/FFO
- [x] Nominal vs economic cap rate (after reserves)
- [x] In-place vs mark-to-market cap rate
- [x] Cap rates vs interest rates: the spread and when it compresses

### `re-returns` Returns
Target: 30 · Written: 30 · Classic: 8 · Status: complete

- [x] Unlevered vs levered IRR
- [x] Equity multiple
- [x] Cash-on-cash
- [x] Yield on cost (returns view)
- [x] NPV
- [x] IRR pitfalls: timing, reinvestment, early distributions
- [x] When IRR and multiple disagree
- [x] Positive vs negative leverage
- [x] Income vs appreciation returns
- [x] Rough target returns by strategy
- [x] Unlevered IRR ≈ going-in cap rate + growth
- [x] Gross vs net returns (fees and promote)
- [x] Hold-period decisions

### `re-debt` Debt, capital markets and credit
Target: 55 · Written: 55 · Classic: 15 · Status: complete

- [x] Lender types: banks, life companies, CMBS conduit and SASB, agencies, debt funds, HUD
- [x] Construction, bridge and permanent loans
- [x] Mezzanine and preferred equity
- [x] The capital stack
- [x] Intercreditor basics: UCC vs mortgage foreclosure
- [x] LTV, LTC, DSCR and debt yield
- [x] Sizing on the binding constraint
- [x] Amortization, interest-only periods and mortgage constants
- [x] Fixed vs floating, SOFR spreads, rate caps and swaps
- [x] Prepayment: lockout, yield maintenance, defeasance, step-downs
- [x] Recourse vs non-recourse; bad-boy carve-outs and guarantees
- [x] Reserves and escrows
- [x] Cash management: lockboxes and sweep triggers
- [x] Extension tests
- [x] Refinancing and maturity risk
- [x] Cash-out refis and recaps
- [x] How a lender underwrites vs how equity underwrites
- [x] Special servicing and workouts: modifications, extensions, discounted payoffs
- [x] Deed-in-lieu vs foreclosure
- [x] A/B notes and loan participations (brief)
- [x] Loan assumptions

### `re-deals` Deal structures and waterfalls
Target: 40 · Written: 41 · Classic: 11 · Status: complete

- [x] JV structures: LP/GP, co-GP, programmatic
- [x] GP co-invest
- [x] Fees: acquisition, asset management, disposition, development
- [x] Preferred return: simple vs compounding, cumulative
- [x] IRR vs multiple hurdles
- [x] Catch-ups
- [x] Promote tiers
- [x] Deal-by-deal vs whole-fund waterfalls
- [x] Clawbacks
- [x] Calculating total GP take
- [x] Major decisions, buy-sell and removal rights
- [x] Capital calls and dilution of a non-funding partner
- [x] Fund basics: closed- vs open-end, commitment period, capital calls, dry powder, J-curve, NAV
- [x] REIT basics: distribution requirement, asset and income tests, UPREITs and OP units, traded vs non-traded
- [x] Sale-leasebacks
- [x] Tax at interview depth: depreciation shield, 1031 exchanges, recapture

### `re-acq` Acquisitions process
Target: 30 · Written: 33 · Classic: 9 · Status: complete

- [x] Sourcing on and off market
- [x] Offering memorandums and broker opinions of value
- [x] The underwriting flow
- [x] Broker pro forma vs your underwriting
- [x] Bid rounds and best-and-final
- [x] LOI
- [x] PSA
- [x] Soft vs hard deposits
- [x] Due diligence: property condition, Phase I and II environmental, title, survey, zoning
- [x] Due diligence: estoppels, lease audit, financial audit
- [x] Closing and prorations; closing costs and transfer taxes
- [x] Assuming existing debt
- [x] The IC memo
- [x] Defending key assumptions
- [x] Red flags

### `re-am` Asset management on the job
Target: 50 · Written: 51 · Classic: 14 · Status: complete

- [x] Business plans and tracking execution
- [x] Annual budgets and reforecasts
- [x] Budget-vs-actual variance analysis
- [x] Monthly and quarterly reporting and KPIs
- [x] Evaluating lease proposals: net effective rent, NPV, TI/LC, downtime
- [x] Capex planning: ROI vs maintenance vs life-safety; reserves
- [x] Overseeing property managers; management agreements
- [x] Tax appeals
- [x] Insurance renewals
- [x] Lender reporting and covenant compliance
- [x] Hold/sell analysis: forward IRR from today's value
- [x] Refinance vs hold
- [x] Running a disposition
- [x] Quarterly valuations
- [x] Watchlist assets
- [x] Tenant credit monitoring

### `re-dev` Development and feasibility
Target: 35 · Written: 37 · Classic: 8 · Status: complete

- [x] The development budget: land, hard, soft, financing costs, contingency, developer fee
- [x] Sources and uses
- [x] Capitalized interest and the interest reserve
- [x] Construction loans: equity first, draws, completion guarantees
- [x] Lease-up and stabilization
- [x] Yield on cost vs exit cap: the development spread
- [x] Development margin (profit on cost)
- [x] Residual land value
- [x] Entitlement and construction risk
- [x] Hard-cost contracts: GMP vs cost-plus
- [x] Zoning basics: FAR, density, parking
- [x] Merchant build vs build-to-hold
- [x] What a feasibility study contains
- [x] Break-even rent
- [x] Tax-driven capital: opportunity zones and LIHTC (added in the Phase 4 audit)

### `re-market` Market analysis
Target: 15 · Written: 17 · Classic: 4 · Status: complete

- [x] Supply, demand and absorption
- [x] The construction pipeline
- [x] Vacancy and rent trends
- [x] Submarkets
- [x] Demand drivers: jobs, population, household formation, incomes
- [x] Barriers to entry
- [x] How underwriting uses market data
- [x] Rent regulation (added in the Phase 4 audit)

### `re-acct` Real estate accounting
Target: 15 · Written: 15 · Classic: 4 · Status: complete

- [x] Straight-line vs cash rent
- [x] Depreciation, and why FFO adds it back
- [x] AFFO adjustments
- [x] Above- and below-market lease intangibles
- [x] Impairments
- [x] Lessor accounting basics
- [x] Capitalized interest and development costs

### `re-model` Building a real estate model
Target: 20 · Written: 20 · Classic: 4 · Status: complete

- [x] The order to build a property pro forma
- [x] Rent roll to cash flow
- [x] Debt tab
- [x] Waterfall tab
- [x] Sensitivity tables
- [x] Circularity from construction interest
- [x] XIRR and XNPV
- [x] How real estate modeling tests are structured, and what graders check

---

## Hotels

### `hotel-basics` Hotel fundamentals
Target: 25 · Written: 25 · Classic: 7 · Status: complete

- [x] Why hotels are operating businesses (nightly "leases", volatile cash flow, wider cap rates)
- [x] Chain scales: luxury to economy
- [x] Service levels: full, select and limited service; extended stay
- [x] Resorts, lifestyle hotels, independents and soft brands
- [x] Owner vs brand vs operator
- [x] Management vs franchise vs lease structures (leases more common outside the US)
- [x] Demand drivers and the hotel cycle

### `hotel-metrics` Performance metrics
Target: 35 · Written: 35 · Classic: 9 · Status: complete

- [x] Occupancy, ADR and RevPAR
- [x] TRevPAR
- [x] GOPPAR
- [x] NOI per key
- [x] Available vs sold rooms: out-of-order and complimentary rooms
- [x] Comp sets and the penetration indices (MPI, ARI, RGI)
- [x] Fair share
- [x] Per-occupied-room vs per-available-room metrics
- [x] RevPAR growth from ADR vs occupancy
- [x] Seasonality and day-of-week patterns
- [x] Supply growth and its effect on RevPAR

### `hotel-rm` Demand and revenue management
Target: 25 · Written: 25 · Classic: 7 · Status: complete

- [x] Segments: transient (retail, discount, negotiated, qualified)
- [x] Segments: group (corporate, association, SMERF) and contract
- [x] Channels and their costs: brand.com, OTAs, GDS, wholesale
- [x] BAR
- [x] Length-of-stay controls
- [x] Overbooking
- [x] Pace and pickup
- [x] Group contracts: attrition and cancellation
- [x] Displacement analysis
- [x] Total revenue management

### `hotel-usali` USALI and the hotel P&L
Target: 35 · Written: 35 · Classic: 9 · Status: complete

- [x] Operated departments: rooms, F&B, other operated departments, miscellaneous income
- [x] Departmental expenses and profit
- [x] Undistributed expenses: A&G, IT and telecom, sales and marketing, property operations and maintenance, utilities
- [x] GOP
- [x] Management fees
- [x] Non-operating items: rent, property taxes, insurance
- [x] EBITDA, FF&E reserve and EBITDA less reserve
- [x] Department margins
- [x] Fixed vs variable costs
- [x] Flow-through and flex
- [x] Cost per occupied room and labor productivity
- [x] F&B and banquet metrics

### `hotel-agreements` Management and franchise agreements
Target: 30 · Written: 30 · Classic: 8 · Status: complete

- [x] HMA term and renewals
- [x] Base fee
- [x] Incentive fee and the owner's priority
- [x] Performance tests
- [x] Termination rights, including on sale
- [x] Budget approval
- [x] Reserves under the HMA
- [x] Key money
- [x] Area of protection
- [x] Franchise agreements: royalty, marketing, loyalty and reservation fees
- [x] PIPs in franchise agreements
- [x] Liquidated damages
- [x] Brand-managed vs franchised with a third-party operator
- [x] Conversions and rebranding
- [x] Encumbered vs unencumbered hotels

### `hotel-val` Valuation and investment
Target: 30 · Written: 30 · Classic: 8 · Status: complete

- [x] Stabilized NOI after the FF&E reserve
- [x] Hotel cap rates and why they're wider
- [x] Price per key
- [x] Hotel DCF: ramp-up, RevPAR-driven projections, reversion
- [x] Business enterprise value vs real property
- [x] Hotel REITs and the TRS structure
- [x] Lodging C-corps and EV/EBITDA
- [x] How a buyer underwrites a hotel acquisition
- [x] Deducting a PIP or deferred maintenance from price

### `hotel-capex` Capex, PIPs and reserves
Target: 20 · Written: 21 · Classic: 5 · Status: complete

- [x] The FF&E reserve (commonly about 4% of total revenue, often stepped up in a new hotel's early years; a convention, not a rule)
- [x] PIPs on a sale or rebrand
- [x] Soft goods vs case goods cycles
- [x] ROI capex
- [x] Cost per key
- [x] Renovation displacement

### `hotel-debt` Hotel financing
Target: 20 · Written: 20 · Classic: 5 · Status: complete

- [x] Why lenders size hotels on debt yield
- [x] Higher DSCR requirements and cash management triggers
- [x] FF&E reserve requirements
- [x] Franchise comfort letters
- [x] Seasonality and covenant tests
- [x] Single-asset CMBS for hotels

### `hotel-am` Hotel asset management and development
Target: 30 · Written: 30 · Classic: 8 · Status: complete

- [x] Reviewing the operator's budget
- [x] The monthly P&L review: flow-through, GOP margin, variances, labor
- [x] Benchmarking
- [x] Enforcing performance tests
- [x] ADR vs occupancy strategy
- [x] Group vs transient mix
- [x] Brand selection and repositioning
- [x] Hotel development: cost per key, pre-opening costs, ramp to stabilization
- [x] What a hotel feasibility study contains

---

## Drills

Drills generate fresh numbers every time. `--update-coverage` ticks the ones that are registered.

### IB

- [x] `drill-ib-ev-bridge` EV to equity value bridge and back
- [x] `drill-ib-share-price` Implied share price from a multiple
- [x] `drill-ib-tsm` Diluted shares by the treasury stock method
- [x] `drill-ib-ufcf` Unlevered FCF build
- [x] `drill-ib-tv-gordon` Gordon growth terminal value with the implied exit multiple
- [x] `drill-ib-tv-exit` Exit-multiple terminal value with the implied growth rate
- [x] `drill-ib-discount` Discount factors with the mid-year convention
- [x] `drill-ib-capm` CAPM cost of equity
- [x] `drill-ib-wacc` WACC
- [x] `drill-ib-beta` Unlevering and relevering beta
- [x] `drill-ib-paper-lbo` Paper LBO: MOIC and IRR
- [x] `drill-ib-moic-irr` MOIC to IRR conversion
- [x] `drill-ib-accretion` Accretion/dilution funded with cash, stock or debt, with the earnings-yield shortcut
- [x] `drill-ib-walk` Three-statement walk-through generator
- [x] `drill-ib-wc-days` Working-capital days and the cash conversion cycle
- [x] `drill-ib-leverage` Leverage and coverage ratios
- [x] `drill-ib-goodwill` Goodwill from a purchase price allocation
- [x] `drill-ib-ltm` LTM and calendarization

### Real estate

- [x] `drill-re-noi-build` NOI build from GPR to NOI
- [x] `drill-re-cap-rate` Cap rate, value and NOI (any two give the third)
- [x] `drill-re-exit-value` Exit value from forward NOI and exit cap, net of selling costs
- [x] `drill-re-price-per` Price per SF and per unit
- [x] `drill-re-loan-sizing` Loan sizing on LTV, DSCR and debt yield
- [x] `drill-re-mortgage` Amortizing payment and mortgage constant
- [x] `drill-re-credit-metrics` DSCR, debt yield, LTV and LTC
- [x] `drill-re-coc` Cash-on-cash
- [x] `drill-re-equity-multiple` Equity multiple
- [x] `drill-re-irr` Unlevered vs levered IRR
- [x] `drill-re-leverage` Positive vs negative leverage
- [x] `drill-re-ner` Net effective rent with free rent and TI/LC
- [x] `drill-re-recoveries` Expense-stop and base-year recoveries
- [x] `drill-re-loss-to-lease` Loss-to-lease
- [x] `drill-re-yoc` Yield on cost and development spread
- [x] `drill-re-value-add` Value created by a value-add renovation
- [x] `drill-re-breakeven` Break-even occupancy
- [x] `drill-re-cash-out-refi` Cash-out refinance proceeds
- [x] `drill-re-waterfall` Two-tier waterfall with a pref (simple and compounding) and promote
- [x] `drill-re-gp-take` Total GP take (co-invest plus promote)
- [x] `drill-re-residual-land` Residual land value (extra)
- [x] `drill-re-walt` WALT from a rent roll (extra)

### Hotels

- [x] `drill-hotel-revpar` Occupancy, ADR and RevPAR (any two give the third)
- [x] `drill-hotel-rooms-revenue` Rooms revenue from keys, days, occupancy and ADR
- [x] `drill-hotel-penetration` MPI, ARI and RGI against a comp set
- [x] `drill-hotel-trevpar` TRevPAR and GOPPAR
- [x] `drill-hotel-gop-margin` GOP margin
- [x] `drill-hotel-flow-through` Flow-through
- [x] `drill-hotel-mgmt-fees` Base and incentive management fees
- [x] `drill-hotel-franchise-fees` Franchise fees (royalty plus program fees)
- [x] `drill-hotel-ffe` FF&E reserve and NOI after reserve
- [x] `drill-hotel-value-per-key` Value per key from NOI and cap rate
- [x] `drill-hotel-pip` PIP cost per key and return
- [x] `drill-hotel-loan-sizing` Hotel loan sizing on debt yield
- [x] `drill-hotel-cpor` Cost per occupied room
