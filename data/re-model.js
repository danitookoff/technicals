Deck.add([
  {
    id: "re-model-001",
    track: "re",
    module: "re-model",
    topic: "How a real estate model is built",
    level: 1,
    type: "primer",
    q: "Primer: how a real estate model is built",
    a: "A real estate model turns leases, costs and loan terms into returns. It starts with one assumptions area and sources and uses. Revenue comes from the rent roll, lease by lease or by unit type; subtract operating expenses for NOI. Subtract capital costs and add a sale at the end for unlevered cash flow, then debt service and the loan payoff for levered cash flow. Returns, the partnership waterfall and sensitivity tables sit on top.",
    why: "Pro forma: the projected cash flow. Rent roll: every lease or unit with its rent and dates. Rollover: what happens when a lease expires. Downtime: months a space sits empty between leases. Sources and uses: the money raised and what it pays for; equity is usually the plug. Waterfall: how cash splits between investors (LP) and the sponsor (GP). Hurdle: the return a tier must reach. Sensitivity table: an output across a grid of two inputs. Circularity: a formula that depends on its own result. XIRR: IRR on dated cash flows. Flag: a row of 1s and 0s that switches formulas on or off.",
    visual: { kind: "table", headers: ["", "Stabilized acquisition", "Value-add", "Development"], rows: [
      ["Periods", "Annual", "Annual or monthly", "Monthly"],
      ["Revenue", "In-place leases rolling to market", "Leases plus a renovation or lease-up plan", "Lease-up after completion"],
      ["Debt", "Permanent loan", "Bridge loan with future funding", "Construction loan, then a refinance or sale"],
      ["Hardest part", "Rollover and the exit", "Timing and cost of the plan", "Budget, draws and interest"]
    ]}
  },
  {
    id: "re-model-002",
    track: "re",
    module: "re-model",
    topic: "Build order",
    level: 1,
    type: "walk",
    classic: true,
    q: "Walk me through how you'd build a property acquisition model from scratch.",
    a: "Start with an assumptions area and sources and uses, which set the price, loan and equity. Build revenue from the rent roll, less vacancy and credit loss, plus other income, then subtract operating expenses for NOI. Subtract capital costs and add the sale, priced on the following year's NOI, for unlevered cash flow. Build the debt schedule and subtract debt service and the payoff for levered cash flow; then calculate returns. Waterfall, sensitivities and summary come last.",
    why: "Build in the order the cash moves, so each block reads only from blocks above it: formulas run one way, and any error traces back to a single place. Keep every input in the assumptions area and link everything to it, so one change, or a sensitivity table, flows through the whole model. Use one timeline, the same period in the same column on every tab, so each row takes one formula copied across. Detail such as lease-by-lease rollover or a renovation schedule then plugs into the revenue block without touching the rest.",
    trap: "Set the timing: if year 1 is the 12 months after closing, the purchase sits in year 0 and the sale in the exit year, with that year's cash flow. Booking the purchase in year 1 cuts a year and inflates the IRR.",
    visual: { kind: "flow", steps: [
      { label: "Assumptions and sources and uses", note: "Price, costs, loan and the equity plug" },
      { label: "Revenue", note: "Rent roll, vacancy, credit loss, other income" },
      { label: "NOI", note: "Less operating expenses" },
      { label: "Unlevered cash flow", note: "Less capital costs, plus the sale" },
      { label: "Levered cash flow", note: "Less debt service and the loan payoff" },
      { label: "Returns and waterfall", note: "IRR, multiple, LP and GP splits" },
      { label: "Sensitivities and summary", note: "IRR grids and the recommendation" }
    ]}
  },
  {
    id: "re-model-003",
    track: "re",
    module: "re-model",
    topic: "Equity check",
    level: 1,
    type: "qa",
    q: "How do you calculate the equity check in an acquisition model, and why isn't it just the price minus the loan?",
    a: "Equity is the plug in sources and uses: total uses minus the loan. Uses are the purchase price plus closing costs, loan fees and any capex or reserves funded at closing. All of it is cash the investors put in at time zero, so it belongs in the IRR. Price minus loan understates the equity and overstates every levered return.",
    why: "Sources and uses must balance, so the last source, usually equity, is solved as the difference, and any use you forget quietly shrinks the equity. Two follow-through rules keep the rest of the model consistent. Capex funded at closing is then spent from that pot, so don't deduct the same spending again from operating cash flow. And lender reserves funded at closing usually come back when the loan is repaid, so add any remaining balance to the sale-year cash flow.",
    example: "Price [[$50.0M]], closing costs [[2%]] ($1.0M), a [[60%]] LTV loan ($30.0M) with a [[1%]] fee ($0.3M) and [[$1.7M]] of capex funded at closing. Uses total $53.0M, so equity is $23.0M, not the $20.0M of price minus loan. If the deal returns [[$40.0M]] to equity, that's 1.74x, not 2.0x.",
    trap: "Don't spread the loan fee over the loan's life, as the accounting does. For returns it's cash paid at closing, so it sits in uses and raises the equity check.",
    visual: { kind: "stack", unit: "$M", dp: 1, columns: [
      { title: "Uses", items: [
        { label: "Purchase price", value: 50.0 },
        { label: "Closing costs", value: 1.0 },
        { label: "Loan fee", value: 0.3 },
        { label: "Capex funded at closing", value: 1.7 }
      ]},
      { title: "Sources", items: [
        { label: "Loan", value: 30.0 },
        { label: "Equity (the plug)", value: 23.0, highlight: true }
      ]}
    ]}
  },
  {
    id: "re-model-004",
    track: "re",
    module: "re-model",
    topic: "Lease by lease vs unit type",
    level: 1,
    type: "qa",
    q: "When do you model revenue lease by lease, and when by unit type?",
    a: "Lease by lease for office, retail and industrial, where a handful of tenants each have their own rent, escalations, recoveries and expiry, so each rollover moves cash flow. By unit type for apartments, where hundreds of short leases behave like a pool: you project rent, occupancy and turnover for each floor plan instead.",
    why: "Model at the level where events move cash flow. When one tenant pays 20% of an office building's rent, its expiry year, renewal odds and TI package change the value, so it needs its own row. In a 300-unit building leases roll every month and no single one matters; averages do. A unit-type model starts from the unit mix (count, size, in-place and market rent per floor plan) and lets loss to lease, in-place rent below market, burn off as units turn. Mixed-use buildings combine both: apartments by type, the retail lease by lease.",
    trap: "Growing an office building's total rent at a flat rate is the costly shortcut: it hides a big expiry. The reverse, modeling 300 apartment leases one by one in a timed test, just burns time.",
    visual: { kind: "table", headers: ["", "Lease by lease", "By unit type"], rows: [
      ["Used for", "Office, retail, industrial", "Apartments"],
      ["One row per", "Tenant or suite", "Floor plan"],
      ["Key inputs", "Rent, escalations, recoveries, expiry, renewal odds, TI and LCs", "Unit count, in-place and market rent, occupancy, turnover"],
      ["Cash flow moves with", "Specific expiries", "Averages across the pool"]
    ]}
  },
  {
    id: "re-model-005",
    track: "re",
    module: "re-model",
    topic: "Modeling lease rollover",
    level: 2,
    type: "qa",
    q: "In a lease-by-lease model, how do you handle a lease that expires during the hold?",
    a: "At expiry, switch the row from contract rent to a new lease at market rent, grown to the expiry date. Blend renewal and new-tenant terms by the renewal probability: downtime applies only to the share expected to leave, while free rent, TI and leasing commissions are weighted averages. The new lease then escalates and rolls again at its own expiry.",
    why: "The model can't know whether the tenant stays, so it carries the expected outcome. A renewing tenant never leaves, which is why downtime is the new-tenant downtime times the chance of leaving. Market rent has to be the rent on the rollover date, not today's, or every future lease is priced in today's market. TI and commissions land when the new lease starts, after any downtime. And watch for second rollovers: a five-year lease signed in year 2 rolls again in year 7, inside a ten-year hold.",
    example: "A [[20,000]] SF lease at [[$36]]/SF expires mid-year 3, when market rent will be [[$42]]/SF. At [[70%]] renewal, [[6]] months of new-tenant downtime blends to 1.8, and free rent of [[1]] month for a renewal or [[4]] for a new tenant blends to 1.9. Year 3: six months at $36 ($360K), 3.7 months with no rent, then 2.3 months at $42 ($161K). That's $521K, against $720K a year before.",
    trap: "Don't carry the old contract rent into the new lease. The new lease resets to market, which can be below the expiring rent: a roll-down, common when leases were signed near a market peak.",
    visual: { kind: "table", headers: ["Year 3", "Months", "Rent"], rows: [
      ["Old lease at [[$36]]/SF", "6", "$360K"],
      ["Blended downtime and free rent", "3.7", "$0"],
      ["New lease at [[$42]]/SF", "2.3", "$161K"],
      ["Total", "12", "$521K"]
    ]}
  },
  {
    id: "re-model-006",
    track: "re",
    module: "re-model",
    topic: "General vacancy and credit loss",
    level: 3,
    type: "qa",
    q: "You've modeled downtime at every lease expiry. How do you add general vacancy and credit loss without double-counting?",
    a: "Treat general vacancy as a floor, not an add-on: charge only the amount by which the target vacancy exceeds the downtime already modeled that year. Credit loss is separate, a small percentage of the rent actually billed, since empty space can't default. Total vacancy then never falls below the target, and a heavy rollover year isn't penalized twice.",
    why: "Downtime and general vacancy measure the same thing, rent lost to empty space. A full 5% on top of a heavy rollover year counts that loss twice, while no general vacancy at all assumes every tenant renews or is replaced exactly on schedule, which rarely happens over ten years. The floor handles both, and lease-by-lease software such as ARGUS offers it as a setting. Credit loss is a different risk, tenants who occupy space but don't pay, so it stays a separate line. Lenders commonly underwrite a minimum vacancy even on a fully leased building.",
    formula: "General vacancy = max(0, target vacancy × potential rent − rent lost to downtime)\nCredit loss = credit loss rate × rent billed after vacancy",
    example: "Potential rent is [[$10.0M]] a year and target vacancy [[5%]] ($500K). Year 3: downtime already costs [[$400K]], so general vacancy adds $100K. Year 4: no rollover, so it's the full $500K. Year 5: downtime costs [[$900K]], so general vacancy is zero and vacancy runs 9%. Credit loss at [[1%]] of billed rent: $95K in years 3 and 4, $91K in year 5.",
    trap: "Say which base the percentage uses: potential rent alone, or all revenue including expense recoveries. Practice varies, and 5% of the larger base is a bigger haircut."
  },
  {
    id: "re-model-007",
    track: "re",
    module: "re-model",
    topic: "Renovation program",
    level: 2,
    type: "qa",
    q: "How do you model a unit renovation program in a value-add apartment model?",
    a: "Drive it from a schedule of units renovated each month, paced by move-outs, since you renovate units as tenants leave. Each unit loses rent while it's offline, then re-leases at market rent plus the renovation premium. Capex is spent as units are done. Revenue is unrenovated units at current rents plus renovated units at premium rents, less vacancy.",
    why: "One schedule drives everything: change the pace and the downtime, capex and premium all move together. Move-outs set the pace because renovating occupied units means buying out tenants or waiting for leases to end. The schedule also explains why value-add cash flow dips first: capex and lost rent come at once, while the premium builds unit by unit. Keep classic and renovated units in separate rows, each with its own rent and growth, so the premium and its ramp stay visible, and test the premium against renovated comparables.",
    example: "[[200]] units with [[48%]] annual turnover: 8 move-outs a month, so renovate [[8]] a month. Each costs [[$12,000]], sits empty [[1]] month and earns a [[$175]] monthly premium: a 17.5% return on cost. Year 1 spends $1.15M on 96 units but earns only $92K of premium, since each unit starts paying partway through the year. With all 200 done, in month 25, the premium runs at $420K a year.",
    trap: "Don't renovate faster than units turn over. A plan for 20 a month in a building with 8 move-outs has to buy tenants out or hold units empty, and the model should show that cost."
  },
  {
    id: "re-model-008",
    track: "re",
    module: "re-model",
    topic: "Debt tab",
    level: 2,
    type: "walk",
    classic: true,
    q: "Walk me through building the debt tab of an acquisition model.",
    a: "Size the loan first, at the lowest amount the lender's tests allow or the LTV you're given, and send the loan and its fees to sources and uses. Then build the schedule by period: beginning balance, interest, principal and ending balance, with a flag switching from interest-only to amortizing. Link debt service to the cash flow. In the sale year, repay the ending balance plus any exit fee or prepayment penalty. Finish with DSCR and debt yield by year.",
    why: "Each period's ending balance becomes the next beginning balance, so a new rate, term or interest-only period flows through on its own. Charge interest on the beginning balance, the usual convention with monthly periods, and set principal as the payment minus interest once amortization starts. The payoff is the balance at the sale date, lower than the original loan if it amortized. Coverage by year shows whether the loan still works when interest-only ends or NOI dips, which a lender will check before you do.",
    formula: "Interest = beginning balance × periodic rate\nPrincipal = payment − interest, or zero while interest-only\nEnding balance = beginning balance − principal\nPayoff at sale = ending balance in the exit year + exit fees",
    trap: "Floating-rate loans need a rate row: the index plus the spread, floored where the loan has a floor and capped if you model the rate cap. One hard-coded rate for the whole hold hides the risk.",
    visual: { kind: "flow", steps: [
      { label: "Size", note: "Lowest of the lender's tests, or the given LTV" },
      { label: "Fund", note: "Loan and fees into sources and uses" },
      { label: "Schedule", note: "Balance, interest and principal, with an interest-only flag" },
      { label: "Link", note: "Debt service into levered cash flow" },
      { label: "Pay off", note: "Ending balance plus exit costs in the sale year" },
      { label: "Check", note: "DSCR and debt yield by year" }
    ]}
  },
  {
    id: "re-model-009",
    track: "re",
    module: "re-model",
    topic: "Interest-only then amortizing",
    level: 2,
    type: "qa",
    q: "A $30M loan at 6.0% is interest-only for two years, then amortizes on a 30-year schedule. What's the debt service in years 1 and 3, and the payoff at a year-5 sale?",
    a: "$1.80M a year while interest-only, then $2.16M from year 3, a 20% jump. The 30-year schedule starts when interest-only ends, the usual convention, so a year-5 sale comes after 36 monthly amortizing payments and the payoff is about $28.8M. Only about $1.2M of principal has been repaid.",
    why: "In the model, a flag marks the interest-only months; after them, the payment is a standard 30-year payment on the full $30M. Early payments are mostly interest, which is why the balance barely moves. Two slips are common: amortizing over 28 years because two have passed, which lifts the payment to $2.21M, and starting the schedule at closing, which understates the payoff at $27.9M. Test DSCR in the first amortizing year, where coverage is usually thinnest.",
    trap: "Pay off the balance at the sale date, not the original $30M and not the balance at the start of year 5. In an annual model, that means the ending balance of the exit year.",
    visual: { kind: "table", headers: ["Year", "Debt service", "Interest", "Principal", "Ending balance"], rows: [
      ["1", "$1.80M", "$1.80M", "$0", "$30.00M"],
      ["2", "$1.80M", "$1.80M", "$0", "$30.00M"],
      ["3", "$2.16M", "$1.79M", "$0.37M", "$29.63M"],
      ["4", "$2.16M", "$1.77M", "$0.39M", "$29.24M"],
      ["5", "$2.16M", "$1.74M", "$0.42M", "$28.83M"]
    ], caption: "Monthly payments summed by year. Rounded, so a row may be off by $0.01M." }
  },
  {
    id: "re-model-010",
    track: "re",
    module: "re-model",
    topic: "Waterfall tab",
    level: 2,
    type: "walk",
    classic: true,
    q: "Walk me through how you'd lay out an equity waterfall tab in Excel.",
    a: "Start from the deal's levered cash flow: negative periods are contributions, positive ones distributions. Give each tier its own block with a balance owed at its hurdle: last period's balance grown at the hurdle rate, plus contributions, less distributions. Each tier pays the lesser of the cash left and what clears its balance, splits it between LP and GP and passes the rest down. The last tier splits whatever remains. Then add checks.",
    why: "A running balance at each hurdle is what makes IRR hurdles work with irregular cash: when it reaches zero, the partner has earned exactly that IRR. Every dollar the LP receives, from any tier, reduces every hurdle balance, because it counts toward each return. Checks catch most errors: each period the tiers add up to the cash available, and LP plus GP equals the total. Then test the hurdle math: set the sale price so the first tier is paid exactly, and the LP's IRR should equal the pref.",
    trap: "Match compounding to the partnership agreement. An 8% pref compounded annually grows a monthly balance at 1.08^(1/12) − 1, about 0.643% a month; 8% ÷ 12 (0.667%) quietly raises the hurdle to 8.3%.",
    visual: { kind: "flow", steps: [
      { label: "Levered cash flow", note: "Contributions (−) and distributions (+) by period" },
      { label: "Tier 1", note: "Return of capital plus the pref" },
      { label: "Tier 2", note: "Split with promote up to the next hurdle" },
      { label: "Final tier", note: "Split whatever remains" },
      { label: "Checks", note: "Tiers sum to the cash; LP plus GP equals the total" }
    ]}
  },
  {
    id: "re-model-011",
    track: "re",
    module: "re-model",
    topic: "IRR hurdle balance",
    level: 3,
    type: "qa",
    q: "An LP invests $10M, receives $1.0M in year 1 and $0.5M in year 2, and the deal sells in year 3. How much must it get at sale for an 8% IRR, and how does a waterfall work it out?",
    a: "$10.89M. The waterfall rolls a hurdle balance forward: grow it 8% a year and subtract each distribution. $10M grows to $10.8M, less $1.0M is $9.8M; that grows to $10.58M, less $0.5M is $10.08M; that grows to $10.89M at sale. Paying exactly that gives the LP an 8% IRR; anything more moves to the next tier.",
    why: "The balance is the LP's capital plus unpaid pref, compounding at the hurdle rate: IRR math run as an account. Distributions shrink it, so the more cash paid along the way, the less is needed at sale. That's why it works for any pattern of contributions and distributions, while a shortcut like $10M × 1.08³ ($12.60M) ignores the interim cash and overstates the target. Higher tiers keep their own balances at their own rates, and every distribution reduces all of them.",
    example: "Check: −[[$10.0M]], [[$1.0M]], [[$0.5M]] and $10.89M solve to an 8.0% IRR. The same flows need $12.23M at sale to clear a [[12%]] hurdle, so with a second tier at 12%, the LP's sale cash between $10.89M and $12.23M falls in tier 2.",
    trap: "Grow the balance before subtracting the period's distribution, and add contributions when they're made. Subtracting first treats cash as paid a period early, so the tier stops short of the true IRR.",
    visual: { kind: "table", headers: ["Year", "Opening", "Growth at 8%", "Distribution", "Closing"], rows: [
      ["1", "[[$10.00M]]", "$0.80M", "−[[$1.00M]]", "$9.80M"],
      ["2", "$9.80M", "$0.78M", "−[[$0.50M]]", "$10.08M"],
      ["3", "$10.08M", "$0.81M", "−$10.89M", "$0.00M"]
    ]}
  },
  {
    id: "re-model-012",
    track: "re",
    module: "re-model",
    topic: "Sensitivity tables",
    level: 2,
    type: "qa",
    classic: true,
    q: "Which sensitivity tables would you build in an acquisition model, and how do you set them up?",
    a: "Two-way tables of levered IRR, and often the equity multiple: purchase price against exit cap rate and exit cap against rent growth. Add pairs that fit the plan, such as renovation premium or construction cost against exit cap, or interest rate against leverage for floating-rate debt. Center each table on the base case and step inputs the way markets move.",
    why: "Pair the variable you control with the ones you don't. Price is the decision, so price against exit cap shows how high you can bid and still clear the target. Exit cap and rent growth drive most of a property's value, so crossing them shows how wrong the market can be before the deal misses. Realistic steps (25 bps on cap rates, 50 bps on growth, a few percent on price) keep the grid meaningful, and shading the cells that clear the target IRR turns it into a decision tool.",
    trap: "Don't cross two inputs that are really one: with NOI fixed, purchase price and going-in cap rate are the same variable. And check the center cell: if it doesn't match the base-case IRR, the table isn't linked properly.",
    visual: { kind: "table", headers: ["", "Exit [[6.00%]]", "Exit [[6.25%]]", "Exit [[6.50%]]"], rows: [
      ["Price [[$48M]]", "15.0%", "13.4%", "11.9%"],
      ["Price [[$50M]]", "12.8%", "11.2%", "9.6%"],
      ["Price [[$52M]]", "10.7%", "9.0%", "7.4%"]
    ], caption: "Levered IRR. Year-1 NOI [[$3.0M]] growing [[3%]]; a loan of [[60%]] of the price, interest-only at [[5.5%]]; a [[5]]-year hold; [[2%]] selling costs and no closing costs. The base case sits in the center." }
  },
  {
    id: "re-model-013",
    track: "re",
    module: "re-model",
    topic: "Breaking the interest circularity",
    level: 3,
    type: "qa",
    q: "A development model has a circular reference from construction interest. How can you break it, and which method would you use in a timed test?",
    a: "Three ways: hard-code an estimate, such as average loan balance × rate × time; turn on iterative calculation, behind a switch that breaks the loop if errors appear; or run a copy-paste macro that pastes the calculated interest in as values until it stops changing. In a timed test, use the estimate or switch-guarded iteration. The macro suits live models.",
    why: "Monthly interest on the opening balance isn't circular by itself; the loop comes from sizing the loan on a budget that includes that interest. Each fix trades precision against stability. The estimate never breaks, but it goes stale when the budget or rate changes. Iteration is exact, but a single error value feeds around the loop and sticks until the switch resets it to zero. The macro is exact and stable, which is why many firms use it on live deals, but a data table can't run it, so every sensitivity case keeps the base case's interest.",
    formula: "Circuit breaker: interest in the budget = schedule interest × switch (1 on, 0 off)\nEstimate check: hard-coded interest − schedule interest, which should be zero",
    trap: "Don't turn on iteration and forget it. Excel then stops warning you about new circular references, so an accidental loop elsewhere goes unnoticed. Keep one intended loop and test the model with the switch off.",
    visual: { kind: "table", headers: ["Method", "Strength", "Weakness"], rows: [
      ["Average-balance estimate", "Fast; never breaks", "Approximate; goes stale"],
      ["Iterative calculation", "Exact and automatic", "Errors stick without a switch"],
      ["Copy-paste macro", "Exact and stable", "Must be rerun; data tables can't run it"],
      ["Algebra", "Exact in one step", "Only for simple structures"]
    ]}
  },
  {
    id: "re-model-014",
    track: "re",
    module: "re-model",
    topic: "XIRR and development timing",
    level: 2,
    type: "qa",
    q: "A development's equity goes in at $1M a month for 12 months, and $20M comes back 36 months after the first draw. What's the IRR, and why use XIRR instead of an annual model?",
    a: "About 22%. XIRR discounts each cash flow by its actual date, so it sees that the average dollar goes in 5.5 months after the first. An annual model with all $12M at time zero shows 18.6%, treating the money as invested longer than it was. On a short development hold, timing moves the IRR by points.",
    why: "Development cash is front-loaded and uneven. Equity funds land and early costs and the construction loan funds the rest; little comes back until a sale or refinance. XIRR works from exact days on a 365-day year, so a mid-month closing or a sale slipping a quarter shows up in the return. XNPV does the same for value, discounting every flow to the first date in the range. Annual shortcuts can err either way: putting a year's contributions at year-end overstates the IRR instead.",
    example: "Equity of [[$1M]] a month for [[12]] months, [[$20M]] back at month [[36]]. All equity at time zero: 18.6%. All at the end of year 1: 29.1%. Monthly: 1.68% a month, which compounds to 22.2% a year; XIRR on actual dates gives about the same.",
    trap: "Don't annualize a monthly IRR by multiplying by 12: here that gives 20.2%, not 22.2%. The monthly rate compounds: (1 + monthly IRR)^12 − 1."
  },
  {
    id: "re-model-015",
    track: "re",
    module: "re-model",
    topic: "Annual vs monthly models",
    level: 1,
    type: "qa",
    q: "When would you build a monthly model instead of an annual one?",
    a: "When timing within the year moves returns: development, lease-up, heavy renovations and construction loans, or any short hold. Draws, interest, renovated units and lease starts happen month by month, and a few months change a short deal's IRR. A stabilized property held five to ten years is usually fine annually. Many models calculate monthly and summarize annually.",
    why: "An annual model puts each year's cash at one point, usually year-end, so it can't show a loan drawn over 18 months or a tenant starting in month 7. For a stable building the errors are small and roughly cancel. In a development they compound: interest depends on each month's balance, and the equity IRR depends on when each dollar goes in. Monthly models take longer to build and audit, which is why the common compromise is monthly calculations rolled up into annual columns for presentation.",
    trap: "Calculate returns on the monthly cash flows, not the annual roll-up. Summing to annual columns moves cash to year-end, which can shift a short deal's IRR by points."
  },
  {
    id: "re-model-016",
    track: "re",
    module: "re-model",
    topic: "Modeling test formats",
    level: 1,
    type: "qa",
    q: "How are real estate modeling tests usually structured?",
    a: "Usually a timed Excel case, often one to three hours: from a prompt with a rent roll or unit mix, operating costs, loan terms and an exit, build the model and report returns and a recommendation. Take-home cases allow days, add a memo or slides and leave more to judgment. Some firms add a short paper test of returns math.",
    why: "Each format tests something different. The timed case checks speed and accuracy: can you get from assumptions to a correct levered IRR without help? The take-home checks judgment: which assumptions you challenge, what risks you flag and whether the recommendation follows from the numbers. Prompts are often vague on purpose, about timing, reserves or fees, so note each assumption you make. Office and retail prompts lean on lease rollover; multifamily on unit mix and renovation premiums; development on budgets, draws and interest. Some also ask for a simple waterfall.",
    trap: "Don't polish before you have an answer. Build a simple complete model first, from pro forma through debt to returns, then refine: a finished simple model beats an elegant half-built one."
  },
  {
    id: "re-model-017",
    track: "re",
    module: "re-model",
    topic: "What graders check",
    level: 2,
    type: "qa",
    q: "What do graders look for in a real estate modeling test?",
    a: "Correct outputs first: IRR, multiple and profit near their answer key. Then a model they can follow: inputs in one place and colored blue, consistent formulas across each row and no numbers typed inside formulas. Then visible checks: sources equal uses, the loan is repaid at sale and the waterfall adds up. Last, a clear summary with a recommendation.",
    why: "A grader has minutes per model, so they start where errors show, the returns. If yours are off, they trace backward, and a clean layout lets them find one small mistake and still give credit, while hard-codes buried in formulas hide it. Visible checks show you verified your own work. The summary shows judgment: price, going-in cap rate, unlevered and levered IRR, multiple, equity required and DSCR on one screen, with a view on the main risk, tells them you'd be useful on a live deal.",
    trap: "Don't force a check to zero with a plug. A visible check that doesn't tie, with a note on why, costs less than a hidden balancing number a grader will find."
  },
  {
    id: "re-model-018",
    track: "re",
    module: "re-model",
    topic: "Common modeling errors",
    level: 2,
    type: "qa",
    q: "What are the most common errors in a real estate acquisition model, and how much do they move returns?",
    a: "Most sit at the exit or at closing: selling on the final year's NOI instead of the next year's, no selling costs, no loan payoff and an equity check without closing costs and fees. Then come a reserve counted both above and below NOI and growth that starts a year early. Several move the IRR by a point or more.",
    why: "They survive because the model still runs and the IRR still looks plausible. The exit is usually the largest cash flow, so errors there move returns most, and a missing loan payoff hands the lender's money to the equity. Closing-cost errors shrink the equity at time zero, which flatters every levered metric. Double-counting works the other way, taking cash out twice each year. Tracing one year's cash by hand, from rent to distributions, catches most of them in minutes.",
    example: "Base case: buy for [[$50M]] at a [[6.0%]] cap with [[3%]] growth and [[2%]] closing costs; [[60%]] interest-only debt at [[5.5%]] with a [[1%]] fee; a [[$75K]] reserve growing [[3%]]; sell after [[5]] years at a [[6.25%]] cap less [[2%]]. Levered IRR: 9.3%. Selling on year-5 NOI cuts the price by $1.6M; skipping selling costs adds $1.1M.",
    trap: "The follow-up: which is worst? A missing loan payoff, which here turns 9.3% into 25.5%. Any IRR that looks too good sends you to the exit first.",
    visual: { kind: "bars", unit: "%", dp: 1, items: [
      { label: "Correct model", value: 9.3, highlight: true },
      { label: "Exit on year-5 NOI", value: 8.1 },
      { label: "Reserve counted twice", value: 7.9 },
      { label: "No selling costs", value: 10.1 },
      { label: "Equity is price minus loan", value: 10.8 },
      { label: "Growth starts in year 1", value: 10.9 },
      { label: "No loan payoff", value: 25.5 }
    ], caption: "Levered IRR with one error at a time" }
  },
  {
    id: "re-model-019",
    track: "re",
    module: "re-model",
    topic: "Sanity-checking model outputs",
    level: 2,
    type: "qa",
    q: "Your model shows a 24% levered IRR on a stabilized apartment deal: a 5.5% going-in cap, 3% NOI growth and 60% interest-only debt at 6%. How do you check it quickly?",
    a: "Benchmark it. Unlevered IRR should be near the cap rate plus growth, about 8.5%. Leverage adds the spread over the debt cost times debt ÷ equity: 8.5% + 2.5% × 1.5, about 12%. A 24% result is double that, so find what's doing the work: the exit cap, a missing loan payoff, the equity check or a jump in NOI.",
    why: "The two shortcuts hold when the exit cap matches the going-in cap and NOI grows steadily, roughly a stabilized deal's base case, so a model far from them is driven by something else. It may be legitimate, such as a lower exit cap or a plan that lifts NOI, but then it's an assumption you can point to. Then check top-down: sources equal uses, the going-in cap on your price, NOI year by year, the exit's implied cap rate, its price per unit and the loan repaid at sale.",
    example: "Over a [[5]]-year hold with a flat [[5.5%]] exit and no costs, a full model gives 11.8%, close to the benchmark. Reaching 24% takes an exit cap near 4.0%, 150 bps below the going-in cap; leaving out the loan payoff gives 27.4%. The first is an assumption to defend, the second an error.",
    trap: "Check the multiple too. A 12% IRR over five years goes with roughly 1.7x; the 4.0% exit version shows 2.8x. When both look too good, the cause is usually at the exit, which drives both."
  },
  {
    id: "re-model-020",
    track: "re",
    module: "re-model",
    topic: "Flexible hold period",
    level: 3,
    type: "qa",
    q: "How do you build a model so the hold period can change with one input?",
    a: "Use flags: an operating flag of 1 up to the exit year and 0 after, and a sale flag of 1 in the exit year only. Multiply cash flows by the operating flag, and sale proceeds, priced every year on next year's NOI, by the sale flag. Treat the loan payoff the same way, and returns update for any hold.",
    why: "Hard-coding a year-5 sale means rebuilding the model to test year 3 or 7, and a committee will ask. With flags, every year carries a potential sale: one input moves the exit, and a data table can show IRR by hold period. It also forces the projection to run a year past the longest hold, since each sale needs the next year's NOI. The IRR range should cover every possible exit year: zeros after the sale don't change the answer.",
    formula: "Operating flag = 1 if year ≤ exit year, else 0\nSale flag = 1 if year = exit year, else 0\nCash flow = operating cash flow × operating flag + (net sale proceeds − loan payoff) × sale flag",
    trap: "Pull the exit NOI from the next column relative to each year, not from a fixed cell like year 6, or the sale uses the wrong year's NOI as soon as the hold changes.",
    visual: { kind: "table", headers: ["Year", "Operating flag", "Sale flag"], rows: [
      ["1", 1, 0],
      ["2", 1, 0],
      ["3", 1, 0],
      ["4", 1, 1],
      ["5", 0, 0],
      ["6", 0, 0]
    ], caption: "Exit year input: [[4]]. Year 5 is still projected, for the year-4 sale's NOI." }
  }
]);
