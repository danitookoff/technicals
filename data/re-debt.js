Deck.add([
  {
    id: "re-debt-001",
    track: "re",
    module: "re-debt",
    topic: "Capital stack and loan sizing",
    level: 1,
    type: "primer",
    q: "Primer: the capital stack and how lenders size loans",
    a: "A deal is funded in layers. Senior mortgage debt is the cheapest and is repaid first. Mezzanine debt or preferred equity can sit above it, costing more for more risk. Common equity sits on top: paid last, but it keeps the upside. Lenders cap the senior loan with a few ratios (LTV, LTC, DSCR and debt yield) and lend the lowest amount any of them allows.",
    why: "LTV: loan ÷ property value. LTC: loan ÷ total project cost, used for construction and heavy renovations. DSCR: NOI ÷ annual debt service. Debt yield: NOI ÷ loan. Mezzanine debt: a loan secured by the ownership interests in the company that owns the property. Preferred equity: equity with a priority return, paid after all debt but before common equity.",
    visual: { kind: "stack", unit: "%", items: [
      { label: "Common equity", value: 20 },
      { label: "Mezzanine or preferred equity", value: 15 },
      { label: "Senior mortgage", value: 65, highlight: true }
    ], caption: "Illustrative stack: cost and risk rise toward the top, repayment priority toward the bottom." }
  },
  {
    id: "re-debt-002",
    track: "re",
    module: "re-debt",
    topic: "Loan sizing",
    level: 2,
    type: "qa",
    classic: true,
    q: "A lender quotes 65% LTV, 1.25x DSCR and a 9% debt yield. How do you size the loan?",
    a: "Calculate the maximum loan under each test and take the smallest. The test that produces the lowest number is the binding constraint, and it sets the loan.",
    why: "Each test protects the lender from a different risk. LTV guards against the value falling. DSCR checks that today's NOI covers the payments at this rate and amortization. Debt yield is the lender's cash return if it had to take the property back, and it ignores interest rates and cap rates entirely. The lender only lends what every test allows.",
    formula: "LTV loan = value × LTV\nDSCR loan = (NOI ÷ DSCR) ÷ mortgage constant\nDebt yield loan = NOI ÷ debt yield",
    example: "NOI [[$1.8M]], value [[$30M]], [[6.5%]] interest-only. LTV: [[65%]] × [[$30M]] = $19.5M. DSCR: [[$1.8M]] ÷ [[1.25]] = $1.44M of debt service ÷ [[6.5%]] = $22.15M. Debt yield: [[$1.8M]] ÷ [[9%]] = $20.0M. Loan = $19.5M, so LTV binds.",
    trap: "With amortization the mortgage constant is higher than the interest rate, so the DSCR loan shrinks. A common follow-up switches the loan from interest-only to amortizing.",
    visual: { kind: "bars", unit: "$M", items: [
      { label: "LTV", value: 19.5, highlight: true },
      { label: "DSCR", value: 22.15 },
      { label: "Debt yield", value: 20.0 }
    ]}
  },
  {
    id: "re-debt-003",
    track: "re",
    module: "re-debt",
    topic: "DSCR vs debt yield",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between DSCR and debt yield, and why do lenders like debt yield?",
    a: "DSCR is NOI divided by annual debt service: can today's income pay the loan? Debt yield is NOI divided by the loan amount: what would the lender earn on its money if it took the property? Lenders like debt yield because interest rates, amortization and cap rates can't flatter it.",
    why: "DSCR depends on loan terms. With a low rate or long amortization, the same loan shows a comfortable DSCR, so DSCR can be managed through structure. LTV depends on the appraisal, which moves with cap rates. Debt yield uses only NOI and the loan balance, so it answers a blunt question: if the lender ends up owning the building, how much income does it get per dollar lent? That's why CMBS lenders lean on it.",
    formula: "DSCR = NOI ÷ annual debt service\nDebt yield = NOI ÷ loan amount",
    example: "NOI [[$1.5M]], loan [[$18M]] at [[6.0%]] interest-only. Debt service is $1.08M, so DSCR is 1.39x; debt yield is $1.5M ÷ $18M = 8.3%. If the rate fell to [[5.0%]], DSCR would rise to 1.67x while the debt yield stayed at 8.3%.",
    trap: "On an amortizing loan, debt service includes principal. Dividing NOI by interest alone overstates DSCR."
  },
  {
    id: "re-debt-004",
    track: "re",
    module: "re-debt",
    topic: "Mezzanine vs preferred equity",
    level: 2,
    type: "qa",
    classic: true,
    q: "What's the difference between mezzanine debt and preferred equity?",
    a: "Both fill the gap between the senior loan and common equity. Mezzanine debt is a loan to the owner of the property-owning company, secured by a pledge of its ownership interests; if it isn't repaid, the lender forecloses on those interests. Preferred equity is an ownership stake with a priority return, enforced through rights in the partnership agreement.",
    why: "The difference is the remedy. A mezz lender can foreclose on the pledged equity under the UCC (the Uniform Commercial Code), usually far faster than a mortgage foreclosure, and it signs an intercreditor agreement with the senior lender. A preferred equity investor isn't a creditor: if the sponsor misses the pref, its remedy is usually to take control of the partnership or force a sale. Economically the two often look alike, but they rank and enforce differently.",
    trap: "Some senior loans prohibit mezzanine debt but allow preferred equity, which is one reason sponsors use pref. The follow-up: in a sale at a loss, who's paid first? The senior loan, then mezz or pref, then common equity.",
    visual: { kind: "table", headers: ["", "Mezzanine debt", "Preferred equity"], rows: [
      ["What it is", "Loan to the owner entity", "Equity with a priority return"],
      ["Secured by", "Pledge of ownership interests", "Rights in the partnership agreement"],
      ["If unpaid", "UCC foreclosure on the equity", "Take control or force a sale"],
      ["Senior lender's view", "Needs an intercreditor agreement", "Often treated as equity"]
    ]}
  },
  {
    id: "re-debt-005",
    track: "re",
    module: "re-debt",
    topic: "Prepayment",
    level: 3,
    type: "qa",
    q: "What's the difference between yield maintenance and defeasance?",
    a: "Both compensate a fixed-rate lender when a loan is paid off early. Yield maintenance is a cash penalty: roughly the present value of the interest the lender loses, based on the gap between the loan rate and Treasury yields. Defeasance swaps the property collateral for a portfolio of Treasuries that makes the remaining payments, so the loan stays outstanding.",
    why: "A fixed-rate lender, or a CMBS trust whose bondholders expect a fixed stream, loses money if it must reinvest the payoff at lower rates. Yield maintenance charges the borrower for that shortfall directly. Defeasance keeps the promised payments intact by substituting risk-free bonds, which suits securitized loans that can't simply be prepaid. Both get cheaper when rates have risen since the loan was made, because reinvesting is more attractive.",
    trap: "When rates have risen, yield maintenance often shrinks to its floor (commonly around 1% of the balance), and defeasance can even cost less than the loan balance. Expect the question: which gets cheaper when rates rise? Both."
  },
  {
    id: "re-debt-006",
    track: "re",
    module: "re-debt",
    topic: "Lender types",
    level: 1,
    type: "qa",
    classic: true,
    q: "Who are the main commercial real estate lenders, and what does each want?",
    a: "Six main groups: banks, life insurance companies, CMBS lenders, the agencies, debt funds and HUD. Each lends in line with its funding. Banks favor shorter floating-rate loans with recourse. Life companies make long fixed-rate loans on prime assets at low leverage. CMBS lenders make non-recourse loans to sell as bonds. Agencies and HUD back multifamily. Debt funds take transitional deals.",
    why: "A lender's product follows its liabilities. Banks fund with deposits that can leave, so they prefer shorter floating-rate loans and lean on the sponsor's balance sheet and relationship. Life companies owe long, predictable payouts to policyholders, so they want long fixed-rate loans on the safest assets. CMBS lenders keep little risk: they originate loans to sell into bond pools, so the loans must be standardized. Debt funds' investors want higher returns, so they take transitional deals others avoid. Government backing lowers the agencies' and HUD's cost of funds, but their loans come with program rules.",
    trap: "Expect the follow-up: which lender would you use for a vacant office you plan to renovate? Not a life company or CMBS, which want stabilized cash flow. A debt fund or bank bridge loan fits, refinanced into permanent debt once it's leased.",
    visual: { kind: "table", headers: ["", "Typical loans", "What it wants"], rows: [
      ["Banks", "Construction, bridge, shorter terms", "Recourse and a relationship"],
      ["Life companies", "Long-term fixed rate", "Prime stabilized assets, low leverage"],
      ["CMBS", "Fixed-rate non-recourse", "Stable cash flow it can pool and sell"],
      ["Agencies", "Multifamily", "Stabilized apartments, housing goals"],
      ["Debt funds", "Bridge, construction, mezzanine", "Higher yield for more risk"],
      ["HUD", "Long fully amortizing multifamily", "Patient long-term owners"]
    ]}
  },
  {
    id: "re-debt-007",
    track: "re",
    module: "re-debt",
    topic: "Choosing a lender",
    level: 1,
    type: "qa",
    q: "Which type of lender fits each deal: a stabilized apartment building, a ground-up development, a half-empty building to reposition and a low-leverage loan on a prime stabilized office?",
    a: "Stabilized apartments: the agencies, which often offer the best multifamily terms. Ground-up development: a bank construction loan, or a debt fund for more leverage. Repositioning: a bridge loan from a debt fund or bank. Prime stabilized office at low leverage: a life company, with CMBS as the alternative if you want more leverage.",
    why: "Match the asset's stage to the lender's appetite. Permanent lenders (agencies, life companies, CMBS) size on in-place cash flow, so they need a stabilized asset. A building with no income, or a business plan still to execute, needs a lender that sizes on cost and the plan: a bank or debt fund, at a floating rate that's cheap to repay once the plan is done. Among permanent lenders the trade-off is cost against leverage and flexibility: life companies are often cheapest but conservative; CMBS stretches further but is rigid after closing.",
    trap: "Sponsor and loan size matter too. A small loan in a secondary market may not interest a life company at all, and a first-time developer may need a debt fund even where a bank would be cheaper."
  },
  {
    id: "re-debt-008",
    track: "re",
    module: "re-debt",
    topic: "How CMBS works",
    level: 2,
    type: "walk",
    classic: true,
    q: "Walk me through how a CMBS loan is made and securitized.",
    a: "A conduit lender originates fixed-rate loans on stabilized properties to standardized terms and warehouses them. Once it has enough, it pools them, often with other lenders' loans, into a trust. The trust issues bonds in tranches from AAA down to an unrated first-loss piece. Cash pays the tranches in order of seniority; losses hit from the bottom up. Servicers manage the loans for the bondholders.",
    why: "Securitization turns illiquid loans into bonds that many investors can buy, each picking its risk. Most of the pool is rated AAA because the tranches below absorb losses first. The B-piece buyer, who takes the first-loss tranche, earns a high yield, re-underwrites every loan and usually picks the special servicer. The originator profits by selling the loans rather than holding them. Because the loans end up in a trust run by fixed rules, CMBS terms are standardized and hard to change after closing: a master servicer collects payments, and a special servicer takes over defaulted loans.",
    trap: "Don't mix up the servicers: the master servicer collects payments and advances missed ones; the special servicer handles defaults and workouts. The borrower never deals with the bondholders, which is why a CMBS loan is hard to renegotiate.",
    visual: { kind: "flow", steps: [
      { label: "Originate", note: "Fixed-rate loans on stabilized properties" },
      { label: "Aggregate", note: "Held until there's a pool" },
      { label: "Pool into a trust", note: "Often with other lenders' loans" },
      { label: "Issue bonds", note: "AAA tranches down to the first-loss B-piece" },
      { label: "Service", note: "Master servicer; special servicer on default" }
    ]}
  },
  {
    id: "re-debt-009",
    track: "re",
    module: "re-debt",
    topic: "Conduit vs SASB",
    level: 3,
    type: "qa",
    q: "What's the difference between a CMBS conduit deal and a single-asset single-borrower (SASB) deal?",
    a: "A conduit pools dozens of loans on different properties and borrowers, so bondholders rely on diversification. A SASB deal securitizes one large loan, on a single property or one sponsor's portfolio, so investors underwrite that asset directly. SASB suits trophy assets and big portfolios too large for a conduit pool, and it's often floating-rate.",
    why: "Size and concentration drive the choice. One very large loan would dominate a conduit pool, so big loans are either split into notes spread across several conduits or securitized alone. In a SASB deal every bond depends on one property's cash flow and value, so rating agencies look through to that asset and size each tranche's protection to its stressed value. Floating-rate SASB suits sponsors who want the freedom to sell or refinance within a few years. Conduits mostly carry 10-year fixed-rate loans from many smaller borrowers.",
    trap: "The follow-up: which AAA bond is riskier? A SASB bond has no diversification, so it rests entirely on one asset, protected only by the subordination beneath it. A conduit AAA bond leans on the whole pool."
  },
  {
    id: "re-debt-010",
    track: "re",
    module: "re-debt",
    topic: "CMBS pros and cons",
    level: 2,
    type: "qa",
    q: "Why would a borrower choose a CMBS loan, and what are the drawbacks?",
    a: "CMBS often offers more leverage than a life company, long interest-only periods, non-recourse terms and a fixed rate, and it will lend on assets and markets that balance-sheet lenders pass on. The costs: rigid terms after closing, defeasance or yield maintenance to prepay, lockbox controls and a servicer rather than a relationship lender if anything goes wrong.",
    why: "Who ends up owning the loan explains both sides. CMBS lenders underwrite to what bond investors and rating agencies accept rather than to a relationship, so a solid asset in a secondary market can get financed. But once the loan sits in a trust, it's governed by the pooling and servicing agreement and by tax rules for the trust (the REMIC rules) that limit changes to performing loans. The master servicer can't approve a creative modification, and a borrower who needs help usually has to default, or show default is likely, before the special servicer can negotiate.",
    trap: "The follow-up: what can a CMBS borrower still do? Routine consents like leasing approvals go through the master servicer, and many CMBS loans are assumable by a qualified buyer for a fee, which can help at sale when defeasance would be expensive."
  },
  {
    id: "re-debt-011",
    track: "re",
    module: "re-debt",
    topic: "Agency lenders",
    level: 1,
    type: "qa",
    q: "Who are the agency lenders, and why do multifamily borrowers use them?",
    a: "Fannie Mae and Freddie Mac, government-sponsored enterprises that buy or guarantee multifamily loans made by approved lenders and package them into securities. Borrowers use them because they often offer the best terms on stabilized apartments: higher leverage than most permanent lenders, long fixed or floating terms, non-recourse with standard carve-outs and pricing helped by the agencies' guarantee.",
    why: "The agencies exist to keep capital flowing to housing, including in downturns when other lenders pull back. Investors in agency securities rely on the agency's guarantee rather than the property alone, so the cost of funds is low. The catch is scope: they finance multifamily and related housing (student, seniors and manufactured housing), not offices or retail, and they emphasize affordability goals. Approved lenders originate and service the loans: Fannie Mae through its DUS program, where lenders share part of the credit risk, and Freddie Mac through its Optigo network.",
    trap: "The follow-up: how do you add leverage later without refinancing? Agency loans often allow a supplemental loan from the same agency once NOI has grown, which avoids paying a prepayment premium on the first loan."
  },
  {
    id: "re-debt-012",
    track: "re",
    module: "re-debt",
    topic: "HUD loans",
    level: 2,
    type: "qa",
    q: "When would a multifamily borrower use a HUD loan instead of an agency loan?",
    a: "When the longest, cheapest fixed-rate money matters more than speed or flexibility. HUD-insured loans, under FHA programs such as 223(f) for existing properties and 221(d)(4) for new construction, offer fully amortizing terms of up to 35 to 40 years, non-recourse and high leverage. The price is months of processing, mortgage insurance premiums and ongoing HUD oversight.",
    why: "HUD doesn't lend; it insures loans that approved lenders make, and the government backing lets the loans be sold as Ginnie Mae securities at low yields. A long, fully amortizing loan removes refinancing risk: there's no balloon to refinance in a bad market. The trade-offs come with the insurance: slower processing than agency loans, limits on distributions (generally from surplus cash only), prevailing-wage rules on construction and a regulatory agreement. That suits long-term holders who value certainty, less so value-add buyers who plan to sell soon.",
    trap: "The follow-up: why not always use HUD? Speed and control. A buyer who must close in 60 days can't wait months for approval, and a value-add plan clashes with HUD oversight. A common path: buy with a bridge loan, then refinance into HUD once stabilized."
  },
  {
    id: "re-debt-013",
    track: "re",
    module: "re-debt",
    topic: "Debt funds",
    level: 1,
    type: "qa",
    q: "What are debt funds, and why would a borrower pay more to borrow from one?",
    a: "Debt funds are non-bank lenders, such as private credit funds and mortgage REITs, that raise money from investors to make floating-rate bridge, construction and mezzanine loans. Borrowers pay their higher spreads for what banks and permanent lenders won't give: more leverage, a loan on a transitional asset, speed and flexible structure such as future funding for capex and leasing.",
    why: "Their capital costs more than deposits or insurance premiums, so they need higher-yielding loans, and they win by taking risks others avoid: a half-leased building, a heavy renovation, a tight closing timeline. Many boost their own returns by borrowing against their loans through repurchase (repo) lines and CRE CLOs, which are securitizations of bridge loans. For the borrower, the higher rate is often worth it when the loan funds a business plan that will raise NOI enough to refinance into cheaper permanent debt within a few years.",
    trap: "A debt fund's own leverage matters to its borrowers: when repo lenders pull back, a fund may tighten terms or slow future funding. Ask who's behind the loan and whether future funding is committed."
  },
  {
    id: "re-debt-014",
    track: "re",
    module: "re-debt",
    topic: "Construction, bridge and permanent loans",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between construction, bridge and permanent loans?",
    a: "They match the property's stage. A construction loan funds a ground-up build in draws, sized on cost, floating-rate and often with recourse. A bridge loan finances a transitional asset for two or three years while the sponsor leases or renovates it. A permanent loan finances a stabilized property for five years or more, usually fixed-rate and non-recourse, sized on NOI.",
    why: "Each loan prices the risk left in the property. During construction there's no income and real completion risk, so the lender sizes on cost, funds only as work is done and wants guarantees. A bridge loan backs a business plan: there's some income, but not enough to support the final loan, so it's short, floating and often includes future funding for capex. Once the property is stabilized, its NOI can carry a permanent loan, which takes out the earlier loan. Floating rates keep the short loans cheap to prepay, because each plan ends in a refinance or a sale.",
    trap: "The follow-up: what's a mini-perm? A shorter loan, often three to five years, that carries a finished project through lease-up so the sponsor can refinance into a permanent loan once NOI has stabilized.",
    visual: { kind: "table", headers: ["", "Construction", "Bridge", "Permanent"], rows: [
      ["Asset", "Being built", "Transitional", "Stabilized"],
      ["Sized on", "Cost", "Cost and the plan", "In-place NOI"],
      ["Term", "Build plus lease-up", "2–3 years plus extensions", "5–10+ years"],
      ["Rate", "Floating", "Floating", "Usually fixed"],
      ["Recourse", "Often partial", "Varies", "Non-recourse with carve-outs"],
      ["Typical lenders", "Banks, debt funds", "Debt funds, banks", "Life companies, CMBS, agencies"]
    ]}
  },
  {
    id: "re-debt-015",
    track: "re",
    module: "re-debt",
    topic: "Bridge loans",
    level: 1,
    type: "qa",
    q: "What is a bridge loan, and how is one usually structured?",
    a: "A short-term loan on a property that isn't stabilized yet, bridging it to a permanent loan or a sale. It's usually floating-rate and interest-only, runs two or three years with extension options and comes with a rate cap. Many include future funding: the lender advances part of the capex and leasing costs as the business plan is carried out.",
    why: "The lender is financing a business plan, not today's income, so it structures the loan to keep control of the plan. Floating rates and short terms fit because the loan should be repaid within a few years, and prepaying is cheap. Holding back capex dollars as future funding means the lender advances money only as work is done, so the collateral improves with each draw. The sponsor pays for this flexibility with a wider spread and fees, and the whole deal depends on refinancing or selling once NOI has grown.",
    example: "Buy for [[$30.0M]] with a [[$6.0M]] renovation budget. The lender funds [[75%]] of each: $22.5M at closing and $4.5M of future funding as the work is completed, a $27.0M loan. Equity funds $7.5M of the price and $1.5M of the capex, $9.0M in total.",
    trap: "The follow-up: why not fund all the capex at closing? The lender would be lending against improvements that don't exist yet, and the sponsor would pay interest on idle cash. Funding as the work is done protects both.",
    visual: { kind: "stack", unit: "$M", dp: 1, columns: [
      { title: "Uses", items: [
        { label: "Purchase price", value: 30.0 },
        { label: "Renovation", value: 6.0 }
      ]},
      { title: "Sources", items: [
        { label: "Loan at closing", value: 22.5, highlight: true },
        { label: "Future funding", value: 4.5, highlight: true },
        { label: "Equity", value: 9.0 }
      ]}
    ]}
  },
  {
    id: "re-debt-016",
    track: "re",
    module: "re-debt",
    topic: "Loan-to-cost",
    level: 1,
    type: "qa",
    q: "What is loan-to-cost, and why do construction and value-add lenders use it alongside LTV?",
    a: "Loan-to-cost is the loan divided by total project cost: land or purchase price plus construction or capex. Lenders use it because an unbuilt or unstabilized property has no reliable value yet, while cost is known, and it fixes the sponsor's cash at risk. Most also cap the loan at a share of as-stabilized value and take the lower.",
    why: "An as-stabilized value is a projection: it assumes the building gets finished, leased and valued at today's cap rates. Cost is harder to argue with, and one minus LTC is the share of cost the sponsor must fund, which keeps it committed when things go wrong. The LTV test on as-stabilized value catches the opposite problem: a sponsor who overpays or overbuilds, so the finished property is worth little more than it cost. When the margin between value and cost is thin, the LTV test binds.",
    formula: "LTC = loan ÷ total project cost\nLoan = lower of LTC × cost and LTV × as-stabilized value",
    example: "Buy for [[$32M]] and spend [[$8M]] renovating: cost $40M. At [[75%]] LTC the loan could be $30.0M. The lender also caps it at [[60%]] of the [[$46M]] as-stabilized value: $27.6M. The loan is $27.6M, so the sponsor funds $12.4M, not $10.0M.",
    trap: "Watch what counts as cost. Lenders may exclude the developer fee, or credit land at its purchase price rather than today's appraised value, which changes how much equity the sponsor has really put in.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "75% LTC", value: 30.0 },
      { label: "60% as-stabilized LTV", value: 27.6, highlight: true }
    ], caption: "The lower test sets the loan." }
  },
  {
    id: "re-debt-017",
    track: "re",
    module: "re-debt",
    topic: "Intercreditor agreements",
    level: 2,
    type: "qa",
    q: "What does an intercreditor agreement between a senior lender and a mezzanine lender cover?",
    a: "It sets the rules between the lenders. The mezz lender gets notice of senior defaults and the right to cure them, an option to buy the senior loan at par after a default and the right to foreclose on its equity pledge, subject to conditions. The senior lender limits who can own the mezz loan or take over the property.",
    why: "The two loans share one property but have different collateral, so each can hurt the other. A senior foreclosure wipes out the mezz lender's collateral, so the mezz lender needs warning and a chance to fix the default or buy its way into control. A mezz foreclosure changes who owns the borrower, so the senior lender wants a say in who that can be: a qualified transferee with minimum size and experience, which must replace the sponsor's guarantees. The agreement stops each lender from changing its own loan in ways that hurt the other, and may include a standstill: a period the junior lender must wait before enforcing.",
    trap: "The follow-up: why does the cure right matter so much? Without it, a senior foreclosure could wipe out the mezz position over a missed payment the mezz lender would happily have covered.",
    visual: { kind: "table", headers: ["Right", "Holder", "What it does"], rows: [
      ["Notice and cure", "Mezz lender", "Fix a senior default before the senior lender acts"],
      ["Purchase option", "Mezz lender", "Buy the defaulted senior loan at par"],
      ["Equity foreclosure", "Mezz lender", "Take over the borrower, subject to conditions"],
      ["Qualified transferee", "Senior lender", "Limits who can own the mezz loan or the borrower"],
      ["Modification limits", "Both", "Neither changes its loan to the other's harm"],
      ["Standstill", "Senior lender", "The junior lender waits before enforcing"]
    ]}
  },
  {
    id: "re-debt-018",
    track: "re",
    module: "re-debt",
    topic: "Mezzanine default",
    level: 3,
    type: "walk",
    q: "The borrower defaults on a mezzanine loan. Walk me through the mezz lender's options.",
    a: "First, protect the position: if the senior loan is also in default, cure it or buy it at par so the senior lender can't foreclose. Then foreclose on the pledged equity through a UCC sale, often in a month or two. The winner owns the borrower, still subject to the senior loan it must keep current. If the property is worth less than the senior loan, walking away can be the better choice.",
    why: "The mezz lender's collateral is the equity in the company that owns the property, so its value is whatever is left after the senior loan. That's why protecting the senior loan comes first: a senior foreclosure would wipe out the equity it's about to seize. After a UCC foreclosure, the mezz lender steps into the sponsor's shoes: it must be a qualified transferee under the intercreditor, replace the sponsor's guarantees and often hire a new manager. It then owns the property at a basis equal to the senior loan plus its own claim, and profits only if the property is worth more.",
    example: "Property worth [[$90M]], senior loan [[$60M]], mezz loan [[$15M]]. After a UCC foreclosure the mezz lender owns the property subject to the senior loan: its basis is $75M, so it has $15M of cushion. If the property were worth [[$62M]], the equity it would take over is worth only $2M, far below its $15M claim, and it would weigh putting in more money against walking away.",
    trap: "Don't say the mezz lender forecloses on the property. It has no mortgage: it takes the ownership interests, and the senior mortgage stays in place.",
    visual: { kind: "flow", steps: [
      { label: "Senior loan in default?", note: "Cure it or buy it at par" },
      { label: "UCC foreclosure", note: "Sell the pledged equity" },
      { label: "Meet intercreditor conditions", note: "Qualified transferee; replacement guarantees" },
      { label: "Own the borrower", note: "Property still subject to the senior loan" }
    ]}
  },
  {
    id: "re-debt-019",
    track: "re",
    module: "re-debt",
    topic: "Attachment and detachment points",
    level: 3,
    type: "qa",
    q: "A mezz loan runs from 60% to 75% LTV on a 300-unit apartment building worth $100M. What are its attachment point, detachment point and last-dollar basis?",
    a: "It attaches at 60% LTV ($60M) and detaches at 75% ($75M), so its last-dollar basis is $75M ÷ 300 units = $250K per unit. The mezz lender starts losing principal only if the property falls below $75M, a 25% drop, and is wiped out below $60M, a 40% drop.",
    why: "Attachment and detachment describe where a loan sits in the stack. Everything below the attachment point is senior debt ahead of you; everything above the detachment point is equity protecting you. Debt investors think in basis: at $250K per unit, would you be happy owning this building? They compare the last-dollar basis with replacement cost and recent sales, because if things go wrong they may end up owning it at that basis. The thinner the slice, the faster losses go from zero to total once value falls through it.",
    example: "Value [[$100M]], [[300]] units. Senior loan [[$60M]]: $200K per unit. Mezz [[$15M]]: from $200K to $250K per unit. If replacement cost is about [[$300K]] per unit, the mezz lender's last dollar sits well below what it would cost to build, a key comfort.",
    trap: "A low basis doesn't help if the building needs heavy capital or demand is falling. The follow-up: how far can NOI fall before the mezz is impaired? Rerun it with a higher cap rate too.",
    visual: { kind: "stack", unit: "$M", items: [
      { label: "Equity: above 75%", value: 25 },
      { label: "Mezzanine: 60% to 75%", value: 15, highlight: true },
      { label: "Senior loan: up to 60%", value: 60 }
    ], caption: "Losses hit from the top down." }
  },
  {
    id: "re-debt-020",
    track: "re",
    module: "re-debt",
    topic: "Mortgage constant",
    level: 1,
    type: "qa",
    q: "What is a mortgage constant, and how do you calculate it?",
    a: "The mortgage constant is annual debt service, interest plus principal, divided by the loan amount. For an interest-only loan it equals the interest rate; for an amortizing loan it's higher, because each payment also repays principal. Calculate it from the monthly payment: PMT at the monthly rate over the amortization period, times 12, divided by the loan.",
    why: "The constant turns any loan into one number you can use for sizing: the DSCR loan is the maximum debt service divided by the constant. It rises with the rate and with shorter amortization, since principal has to be repaid faster. That's why the same NOI supports less debt on a 25-year schedule than on a 30-year one, and the most on interest-only. Use monthly payments, which is how most US commercial loans pay; an annual-payment formula gives a slightly higher constant.",
    formula: "Monthly payment = loan × i ÷ (1 − (1 + i)^−n), with i = rate ÷ 12 and n = years × 12\nMortgage constant = monthly payment × 12 ÷ loan\nDSCR loan = (NOI ÷ DSCR) ÷ mortgage constant",
    example: "[[$10M]] at [[6.0%]] on a [[30]]-year schedule: the monthly payment is $59,955, or $719K a year, a 7.19% constant. On a [[25]]-year schedule it's 7.73%. With NOI of [[$1.8M]] and a [[1.25x]] DSCR ($1.44M of debt service), those constants support $20.0M and $18.6M; interest-only at 6.0% supports $24.0M.",
    trap: "The follow-up: can the constant ever be below the rate? No. With amortization it's always above the rate, and it approaches the rate only as the amortization period gets very long.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "Interest-only", value: 24.0 },
      { label: "30-year amortization", value: 20.0, highlight: true },
      { label: "25-year amortization", value: 18.6 }
    ], caption: "DSCR loan on $1.44M of debt service at 6.0%" }
  },
  {
    id: "re-debt-021",
    track: "re",
    module: "re-debt",
    topic: "Interest-only periods",
    level: 1,
    type: "qa",
    q: "Why do borrowers want interest-only periods, and how do lenders view them?",
    a: "Interest-only periods cut debt service, which raises cash flow to equity and the DSCR while the business plan plays out. Lenders see the other side: no principal is repaid, so the balance at maturity is higher and refinancing risk grows. Many lenders grant IO only on lower-leverage loans or test DSCR on an amortizing payment anyway.",
    why: "Principal payments aren't a cost, since they build equity in the property, but they come out of today's cash flow. IO lets the sponsor keep that cash, which lifts cash-on-cash and usually IRR. For the lender, amortization is how leverage falls over time, a cushion if value slips. The compromise is often partial IO: a few years interest-only, then amortizing. Plan for the payment jump when IO ends, because a DSCR that looked comfortable can drop sharply.",
    example: "[[$20M]] at [[6.0%]] with NOI of [[$1.8M]]. Interest-only, debt service is $1.20M and DSCR is 1.50x. Amortizing over [[30]] years, debt service is $1.44M and DSCR is 1.25x. When IO ends, payments jump by about $239K a year, 20%.",
    trap: "IO raises the balloon, not just the cash flow: a full-term IO loan owes its whole balance at maturity. Bridge loans are usually IO throughout, and permanent lenders tend to offer long IO only at lower leverage."
  },
  {
    id: "re-debt-022",
    track: "re",
    module: "re-debt",
    topic: "Balloon balance",
    level: 2,
    type: "qa",
    q: "A $20M loan at 6.0% amortizes over 30 years but matures in 10. How much is still owed at maturity, and why does it matter?",
    a: "About $16.7M, so only about 16% of the loan is repaid over the term. Early payments are mostly interest, so amortization barely dents the balance. That leftover balloon has to be refinanced or repaid from a sale at maturity, whatever rates, values and lending standards look like then. That's refinancing risk.",
    why: "On a 30-year schedule, principal repayment starts tiny and grows as interest shrinks, so most of it comes in the later years the loan never reaches. Lenders therefore test the exit: NOI at maturity divided by the balloon (the maturity debt yield) should look like a loan another lender would make. If it doesn't, the loan may not refinance even if the borrower never missed a payment. Shorter amortization reduces the balloon but raises debt service, which is the core trade-off in setting amortization.",
    formula: "Balance after m payments = loan × (1 + i)^m − payment × ((1 + i)^m − 1) ÷ i\ni = annual rate ÷ 12",
    example: "[[$20M]] at [[6.0%]], [[30]]-year amortization: monthly payments of $119,910. After [[120]] payments the balance is $16.74M: $3.26M repaid, while about $11.1M went to interest. After [[60]] payments it's still $18.61M.",
    trap: "Don't assume a 5- or 10-year term pays the loan down much. The follow-up: what's the balloon on an interest-only loan? The full original balance.",
    visual: { kind: "bars", unit: "$M", dp: 2, items: [
      { label: "At closing", value: 20.00 },
      { label: "After 5 years", value: 18.61 },
      { label: "After 10 years", value: 16.74, highlight: true }
    ], caption: "Balance on a 30-year schedule at 6.0%" }
  },
  {
    id: "re-debt-023",
    track: "re",
    module: "re-debt",
    topic: "Rates and loan proceeds",
    level: 2,
    type: "qa",
    classic: true,
    q: "Interest rates rise by 100 bps. What happens to the loan a lender will make on the same property?",
    a: "It usually shrinks. A DSCR-sized loan falls because the same NOI covers less debt at a higher mortgage constant: about 10% less when rates go from 6% to 7% on a 30-year schedule. Debt yield doesn't move with rates, and LTV only moves if cap rates widen and values fall. So rising rates tend to make DSCR the binding test.",
    why: "DSCR sizing works backward from NOI: the maximum debt service is NOI ÷ DSCR, and the loan is that payment divided by the constant. A higher rate raises the constant, so the same payment supports a smaller loan. Debt yield ignores rates entirely. Values usually come under pressure too, because buyers' required returns rise with rates, but cap rates don't move one-for-one. A deal that closed with LTV binding can find DSCR binding at refinance.",
    example: "NOI [[$2.0M]], [[1.25x]] DSCR, [[30]]-year amortization: maximum debt service $1.6M. At [[6.0%]] the constant is 7.19% and the loan $22.2M. At [[7.0%]] the constant is 7.98% and the loan $20.0M, about 10% less. A [[9%]] debt yield allows $22.2M either way.",
    trap: "The follow-up: is the hit bigger or smaller on an interest-only loan? Bigger. The rate is the whole constant, so the IO loan falls from $26.7M to $22.9M, about 14%.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "DSCR at 6.0%", value: 22.2 },
      { label: "DSCR at 7.0%", value: 20.0, highlight: true },
      { label: "9% debt yield", value: 22.2 }
    ], caption: "Loan on the same $2.0M of NOI" }
  },
  {
    id: "re-debt-024",
    track: "re",
    module: "re-debt",
    topic: "Fixed vs floating",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between fixed- and floating-rate CRE loans, and when would you use each?",
    a: "A fixed-rate loan locks the rate for the term; a floating-rate loan resets monthly to a benchmark, usually SOFR, plus a fixed spread. Use fixed for a stabilized asset you'll hold for years with predictable debt service. Use floating for a business plan that ends in a sale or refinance within a few years, because it's cheap to prepay.",
    why: "Each lender protects its own funding. A fixed-rate lender, like a life company or a CMBS trust, owes fixed payments of its own, to policyholders or bondholders, so it charges yield maintenance or defeasance to be repaid early. A floating-rate lender funds itself at floating rates, so an early payoff costs it little, and prepayment is usually open after a short period or a small fee. The borrower trades certainty against flexibility: fixed protects the cash flow if rates rise; floating keeps the exit open but needs a rate cap or swap to manage the rate risk.",
    trap: "Floating isn't automatically cheaper: it moves with SOFR, and the cap a lender requires costs real money when rates are volatile. The follow-up: which fits a three-year value-add plan? Floating, because a fixed loan's prepayment penalty could eat into the sale profit."
  },
  {
    id: "re-debt-025",
    track: "re",
    module: "re-debt",
    topic: "SOFR plus spread",
    level: 1,
    type: "qa",
    q: "A floating-rate loan is priced at SOFR plus 300 bps with a 3.00% SOFR floor. What does the borrower pay?",
    a: "Each month the rate resets to SOFR plus 3.00%, but SOFR is never taken below 3.00%, so the all-in rate can't fall under 6.00%. If SOFR is 4.00%, the borrower pays 7.00%; if SOFR drops to 2.50%, it still pays 6.00%. The spread is fixed for the loan's life and reflects credit risk; SOFR carries the rate risk.",
    why: "SOFR, the Secured Overnight Financing Rate, is a benchmark based on overnight borrowing secured by Treasuries; it replaced LIBOR in US loans. Lenders commonly use one-month Term SOFR, so the rate resets each month. The spread pays the lender for the property's credit risk and is set at closing, so a riskier deal carries a wider spread. A floor protects the lender's minimum yield when rates fall, which costs the borrower the benefit of very low rates.",
    example: "[[$30M]] loan at SOFR + [[300 bps]] with a [[3.00%]] floor. With SOFR at [[4.00%]]: 7.00%, or $2.10M a year. With SOFR at [[2.50%]] the floor applies: 6.00%, or $1.80M a year.",
    trap: "Most floating loans accrue interest on an actual/360 basis, so a year's interest is 365/360 of the quoted rate: 7.00% works out to about 7.10%. Good models capture this."
  },
  {
    id: "re-debt-026",
    track: "re",
    module: "re-debt",
    topic: "Rate caps",
    level: 2,
    type: "qa",
    classic: true,
    q: "What is an interest rate cap, and why do floating-rate lenders require one?",
    a: "A rate cap is an option the borrower buys, for an upfront premium, that pays out whenever SOFR rises above a set strike, so the loan's effective rate can't exceed the strike plus the spread. Lenders usually require one on floating-rate loans so debt service stays covered if rates spike, and they typically take it as collateral.",
    why: "A floating-rate borrower's debt service rises with every SOFR move, while NOI doesn't. Without a cap, a sharp rise could push DSCR below 1.0x and force a default on an otherwise healthy property. The cap turns an open-ended rate risk into a known maximum payment, which is what the lender underwrites. Payments from the cap provider usually go straight to the lender, covering the extra interest. The borrower keeps the benefit if rates fall, since a cap, unlike a swap, only pays one way.",
    example: "[[$50M]] loan at SOFR + [[350 bps]] with a [[4.00%]] strike. If SOFR rises to [[5.50%]], the loan rate is 9.00%, or $4.50M a year. The cap pays 1.50% × $50M = $750K, so the borrower's net cost is $3.75M, an effective 7.50%: strike plus spread.",
    trap: "The cap usually expires with the initial term, and lenders often require a new one to extend, sometimes with a monthly reserve for its cost. Price that into the business plan: replacement caps can be expensive when rates are volatile.",
    visual: { kind: "waterfall", unit: "$M", dp: 2, start: { label: "Interest at 9.00%", value: 4.50 }, steps: [
      { label: "Cap payment", delta: -0.75 }
    ], end: { label: "Net interest (7.50%)", value: 3.75 } }
  },
  {
    id: "re-debt-027",
    track: "re",
    module: "re-debt",
    topic: "Cap strike and cost",
    level: 3,
    type: "qa",
    q: "How does a lender set the required rate cap strike, and what drives the cap's cost?",
    a: "Commonly by working back from a minimum DSCR at the capped rate: the strike is the SOFR level at which NOI still covers interest at, say, 1.0x to 1.1x. The cost rises the lower the strike sits relative to expected SOFR, the longer the term, the bigger the loan and the more volatile rates are.",
    why: "A cap is a strip of call options on SOFR, one for each reset date, so it's priced like options. It's worth more the more likely SOFR is to end up above the strike: a low strike, a long term or volatile rates all raise that chance. The notional usually matches the loan balance. That links underwriting to cost: a highly leveraged loan needs a lower strike to keep DSCR above the floor, so higher leverage makes the cap more expensive too.",
    formula: "Maximum interest = NOI ÷ required DSCR at the cap\nMaximum all-in rate = maximum interest ÷ loan\nStrike = maximum all-in rate − spread",
    example: "NOI [[$3.3M]], loan [[$40M]], spread [[3.00%]], required DSCR at the cap [[1.10x]]. Maximum interest: $3.3M ÷ 1.10 = $3.0M, a 7.50% all-in rate. Strike: 7.50% − 3.00% = 4.50%. Push the loan to [[$44M]] and the maximum rate falls to 6.82%, so the strike drops to 3.82% and the cap costs more.",
    trap: "The follow-up: why not buy a cheaper, higher-strike cap? The lender won't accept a strike that lets DSCR fall below its floor. And the premium is paid upfront, so it's a closing cost that raises the equity needed."
  },
  {
    id: "re-debt-028",
    track: "re",
    module: "re-debt",
    topic: "Caps vs swaps",
    level: 2,
    type: "qa",
    q: "What's the difference between a rate cap and an interest rate swap on a floating-rate loan?",
    a: "A cap is insurance: the borrower pays an upfront premium for protection above the strike and still benefits if rates fall. A swap fixes the rate: the borrower pays a fixed swap rate and receives SOFR, with no upfront premium, but gives up the benefit of falling rates and can owe a breakage payment on an early exit.",
    why: "The choice follows the business plan. A bridge borrower expecting to sell or refinance within a few years wants a cap: a known upfront cost, no penalty for leaving early and upside if rates fall. A long-term holder with a bank loan often swaps to lock in a fixed cost. Breakage then works much like yield maintenance, except it can go either way: if rates have fallen since the swap was signed, the borrower owes the counterparty; if they've risen, the swap is an asset and can pay the borrower.",
    example: "Loan at SOFR + [[250 bps]]. A swap at [[3.75%]] fixes the all-in rate at 6.25% whatever SOFR does. A cap at [[4.00%]] limits it to 6.50%: at SOFR of [[3.00%]] the borrower pays 5.50%, and at [[5.00%]] it pays 6.50%, plus the premium paid upfront.",
    trap: "Don't call a swap free. There's no upfront premium, but the swap rate includes the bank's margin, and breakage can be large if rates fall and you sell early.",
    visual: { kind: "table", headers: ["SOFR", "Unhedged", "Cap at 4.00%", "Swap at 3.75%"], rows: [
      ["[[3.00%]]", "5.50%", "5.50%", "6.25%"],
      ["[[5.00%]]", "7.50%", "6.50%", "6.25%"]
    ], caption: "All-in rate on a loan at SOFR + 2.50%, before the cap premium" }
  },
  {
    id: "re-debt-029",
    track: "re",
    module: "re-debt",
    topic: "Recourse vs non-recourse",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between recourse and non-recourse debt?",
    a: "With non-recourse debt, the lender's only remedy on default is the property: if a foreclosure sale falls short of the loan, the lender takes the loss. With recourse, the lender can also pursue the borrower or a guarantor personally for the shortfall. Most permanent CRE loans are non-recourse apart from bad-boy carve-outs; construction and bank loans often carry some recourse.",
    why: "Property loans are made to single-purpose entities that own nothing but the building, so recourse to the borrower alone is worth little; real recourse means a guarantee from the sponsor or its principals. Non-recourse shifts the downside to the lender, which is why it prices and sizes the loan on the property alone, with conservative leverage, reserves and cash controls. Recourse lets a lender, usually a bank, stretch on a riskier asset or offer better terms to a strong sponsor. Partial recourse, such as a guarantee of 25% of the loan that burns off as the property stabilizes, is common in construction.",
    example: "Loan [[$30M]]; the foreclosure sale nets [[$22M]], an $8M shortfall. Non-recourse: the lender absorbs the $8M. Full recourse: it can pursue the guarantor for all $8M. With a [[25%]] repayment guarantee ($7.5M), it can recover up to $7.5M.",
    trap: "The follow-up: if permanent loans are non-recourse, why does the sponsor still sign a guarantee? For the bad-boy carve-outs and the environmental indemnity, which cover acts the sponsor controls, not market losses."
  },
  {
    id: "re-debt-030",
    track: "re",
    module: "re-debt",
    topic: "Bad-boy carve-outs",
    level: 1,
    type: "qa",
    classic: true,
    q: "What are bad-boy carve-outs in a non-recourse loan?",
    a: "They're exceptions that make a non-recourse loan recourse to a guarantor if the sponsor takes certain actions within its control. Lesser acts, like fraud or misapplying rents, security deposits or insurance proceeds, make the guarantor liable for the lender's losses. The worst, like a voluntary bankruptcy filing or an unapproved sale or second loan, can make the whole loan recourse.",
    why: "Non-recourse lending only works if the sponsor can't hurt the collateral once its equity is underwater. Without carve-outs, a sponsor facing foreclosure could collect rents and keep them, stop paying taxes or file for bankruptcy to stall the lender, all at no personal cost. The carve-outs make those moves expensive, so the sponsor's best option in a bad outcome is a cooperative handback. They don't cover a market decline: if the property simply loses value, the lender still bears the loss.",
    trap: "The follow-up: why is a bankruptcy filing full recourse, not just losses? The automatic stay can freeze foreclosure for months, and losses from delay are hard to measure, so full recourse is the deterrent. Read the full-recourse triggers closely: some are broad.",
    visual: { kind: "table", headers: ["Trigger", "Guarantor owes"], rows: [
      ["Misapplied rents, deposits or insurance proceeds", "Lender's losses"],
      ["Fraud or misrepresentation", "Losses, sometimes the full loan"],
      ["Environmental problems", "Losses, under a separate indemnity"],
      ["Voluntary bankruptcy filing", "Full loan"],
      ["Unapproved sale or extra debt", "Full loan"]
    ], caption: "Lists and tiers vary by loan; read the guaranty." }
  },
  {
    id: "re-debt-031",
    track: "re",
    module: "re-debt",
    topic: "Completion, carry and repayment guarantees",
    level: 2,
    type: "qa",
    q: "What's the difference between a completion guarantee, a carry guarantee and a repayment guarantee?",
    a: "A completion guarantee makes the sponsor finish the project lien-free and to plan, paying any cost overruns. A carry guarantee makes it cover interest, taxes, insurance and operating shortfalls until the property stabilizes. A repayment guarantee makes it repay part or all of the loan itself. Construction lenders commonly require the first two; banks often add the third.",
    why: "Each covers a different way a construction loan fails. A half-built project is worth far less than its cost, so the lender's biggest fear is that the sponsor stops funding: the completion guarantee keeps money going in until it's done. After completion, the building may take a year or more to lease, and the carry guarantee covers the gap until NOI pays the bills. A repayment guarantee covers what's left: a finished, leased building still worth less than the loan. A guarantee is only as good as the guarantor, so lenders set net worth and liquidity covenants.",
    trap: "Repayment guarantees often burn down, say from 50% to 25% of the loan, as the property hits DSCR or occupancy tests. The follow-up: why do sponsors resist full repayment guarantees? They put the sponsor's whole balance sheet behind one asset."
  },
  {
    id: "re-debt-032",
    track: "re",
    module: "re-debt",
    topic: "Reserves and escrows",
    level: 1,
    type: "qa",
    q: "What reserves and escrows do CRE lenders commonly require, and why?",
    a: "The usual set: monthly escrows for property taxes and insurance, an upfront reserve for immediate repairs, tenant improvement and leasing commission (TI/LC) reserves on office or retail properties and a replacement reserve for recurring capital items. Bridge loans often add interest and capex reserves. That puts cash for known costs under the lender's control rather than the borrower's.",
    why: "Unpaid property taxes become a lien ahead of the mortgage, and a lapse in insurance can leave the collateral uninsured, so lenders collect both monthly and pay the bills themselves. Replacement and TI/LC reserves build cash for costs that recur but arrive in lumps, so a big lease rollover doesn't hit when cash is short. The repair reserve is sized from the property condition report, often at about 125% of the estimate to cover overruns. Reserves also reduce the cash the sponsor can distribute, which is part of the point.",
    trap: "Reserves aren't free to the sponsor: the cash sits in a lender account earning little, which drags on returns. Expect to negotiate caps on TI/LC and replacement reserves, or to post a letter of credit instead of cash.",
    visual: { kind: "table", headers: ["Reserve", "Covers", "Funded"], rows: [
      ["Taxes and insurance", "Annual bills", "Monthly, 1/12 of each bill"],
      ["Replacement", "Roofs, HVAC, appliances", "Monthly, per unit or per SF"],
      ["TI/LC", "Re-leasing office and retail space", "Monthly or upfront"],
      ["Immediate repairs", "Deferred maintenance", "Upfront, often about 125%"],
      ["Interest or capex", "Debt service, planned capex", "Upfront, mostly bridge loans"]
    ]}
  },
  {
    id: "re-debt-033",
    track: "re",
    module: "re-debt",
    topic: "Sizing on net cash flow",
    level: 2,
    type: "qa",
    q: "Why do lenders size loans on net cash flow after reserves rather than NOI, and how much can it change the loan?",
    a: "Because recurring capital costs, like replacement reserves, tenant improvements and leasing commissions, are real cash the property must spend to keep its income, even though they sit below NOI. Deducting them gives net cash flow, a truer measure of what's available for debt service. On office and retail, where TI/LC is heavy, the difference is often several percent of NOI.",
    why: "NOI flatters buildings whose tenants need expensive re-leasing. An office tower and an apartment building with the same NOI aren't equally safe: the office will spend heavily on TI and commissions every time a lease rolls. Lenders normalize this by deducting an underwritten reserve, often per SF for TI/LC and per unit or per SF for capital items. CMBS lenders report both NOI and NCF, commonly testing DSCR on NCF; debt yield is often quoted on both. Practice varies, so always say which basis a ratio uses.",
    formula: "Net cash flow = NOI − replacement reserves − TI/LC reserves\nDSCR = NCF ÷ annual debt service",
    example: "Office, [[100,000]] SF, NOI [[$3.0M]]. A TI/LC reserve of [[$1.50]]/SF ($150K) and a capital reserve of [[$0.25]]/SF ($25K) leave NCF of $2.825M. At a [[1.25x]] DSCR and a [[7.0%]] constant: sized on NOI, $2.4M of debt service supports $34.3M; on NCF, $2.26M supports $32.3M, $2.0M less.",
    trap: "Don't double count. If the NOI you're given already deducts reserves, as some owners and appraisers do, don't subtract them again. Ask which basis the seller or broker used.",
    visual: { kind: "waterfall", unit: "$K", start: { label: "NOI", value: 3000 }, steps: [
      { label: "TI/LC reserve", delta: -150 },
      { label: "Capital reserve", delta: -25 }
    ], end: { label: "Net cash flow", value: 2825 } }
  },
  {
    id: "re-debt-034",
    track: "re",
    module: "re-debt",
    topic: "Lender NOI haircuts",
    level: 2,
    type: "qa",
    q: "Why do lenders haircut a sponsor's underwritten NOI, and what do they typically adjust?",
    a: "Because the lender gets no upside, so it underwrites the income it can count on today, not the business plan. Typical adjustments: vacancy at the higher of actual, market or a floor; above-market leases marked down to market; no credit for unsigned leases or tenants in trouble; a market management fee; no rent growth; and reserves deducted.",
    why: "A lender's payoff is capped at interest and fees, while its losses come when income disappoints, so it builds NOI from the bottom: in-place leases, trailing expenses and conservative assumptions. The sponsor's pro forma includes the value-add it hopes to create, which the equity is paid to deliver and the lender isn't. Lenders also underwrite as if they might own the property: an above-market lease expiring in two years is unlikely to renew at that rent, so they size on market rent. The haircut is the gap between the plan and what's provable today.",
    example: "Sponsor NOI [[$4.00M]] assumes [[2%]] vacancy on [[$6.0M]] of GPR. The lender uses a [[5%]] floor, −$180K; marks one above-market lease to market, −[[$100K]]; charges management at [[3%]] of EGI instead of [[2%]], −$50K; and deducts [[$60K]] of reserves. Lender NCF: $3.61M, about 10% lower. Sized at a [[9%]] debt yield, the loan falls from $44.4M to $40.1M.",
    trap: "The follow-up: how is this different from a buyer's normalizations? A buyer adjusts to what it will actually pay, then adds the upside it expects to create; the lender makes similar adjustments but gives no credit for the upside.",
    visual: { kind: "waterfall", unit: "$K", start: { label: "Sponsor NOI", value: 4000 }, steps: [
      { label: "Vacancy at 5%", delta: -180 },
      { label: "Lease to market", delta: -100 },
      { label: "Management at 3%", delta: -50 },
      { label: "Reserves", delta: -60 }
    ], end: { label: "Lender NCF", value: 3610 } }
  },
  {
    id: "re-debt-035",
    track: "re",
    module: "re-debt",
    topic: "Lender vs equity underwriting",
    level: 2,
    type: "qa",
    classic: true,
    q: "How does a lender underwrite a deal differently from an equity investor?",
    a: "The lender underwrites the downside; the equity underwrites the upside. A lender's return is capped at interest and fees, so it focuses on in-place cash flow, coverage and value cushions, the sponsor's strength and whether the loan can be refinanced at maturity. Equity's return is uncapped, so it underwrites the business plan: rent growth, value creation and the exit price.",
    why: "The payoffs are asymmetric. If the deal doubles, the lender still earns its coupon; if it fails, the lender can lose principal. So the lender asks how much can go wrong before it's hurt: how far NOI can fall before DSCR breaks 1.0x, how far value can fall before the loan exceeds it and what the NOI at maturity supports. Equity asks how much can go right and what it's paying for that. The same deal can be a good loan and a bad equity investment, or the reverse.",
    trap: "The follow-up: what's a good loan on a bad equity deal? A sponsor overpaying for a stable building: a 55% LTV loan is safe even if the equity never earns its target. The reverse: a value-add plan that's too risky to lend much against.",
    visual: { kind: "table", headers: ["", "Lender", "Equity"], rows: [
      ["Payoff", "Capped at interest and fees", "Uncapped"],
      ["NOI used", "In-place, haircut", "Business plan"],
      ["Key metrics", "DSCR, debt yield, LTV", "IRR, multiple, cash-on-cash"],
      ["Main question", "How much can go wrong?", "How much can go right?"],
      ["Exit focus", "Refinancing at maturity", "Sale price"]
    ]}
  },
  {
    id: "re-debt-036",
    track: "re",
    module: "re-debt",
    topic: "Underwriting a loan request",
    level: 2,
    type: "walk",
    q: "Walk me through how you'd underwrite a loan request on a stabilized property.",
    a: "Start with the property's cash flow: rent roll, T-12 and leases, adjusted to a lender's NOI and net cash flow. Value it with an appraisal and sales comps. Size the loan on LTV, DSCR and debt yield, and check the refinance at maturity. Then underwrite the market and the sponsor's experience, net worth and liquidity. Finally, set the structure (reserves, cash management, guarantees, covenants) and write up the risks and mitigants for credit committee.",
    why: "Each step answers one question: what does the property really earn, what's it worth, how much debt can that support, who stands behind it and what protects the lender if the plan slips. Cash flow comes first because every sizing ratio and value depends on it. Sponsor strength matters even on non-recourse loans, because an experienced, liquid sponsor is more likely to support the property in a downturn and less likely to walk away early. Structure is where the lender covers the risks the numbers leave open, such as a big lease rolling before maturity.",
    trap: "The follow-up: what's the first thing you'd look at? The rent roll and lease expirations: if a large share of income rolls before maturity, everything else depends on that answer.",
    visual: { kind: "flow", steps: [
      { label: "Cash flow", note: "Rent roll, T-12 and leases to lender NCF" },
      { label: "Value", note: "Appraisal and sales comps" },
      { label: "Size", note: "LTV, DSCR, debt yield; test the maturity" },
      { label: "Sponsor and market", note: "Experience, net worth, liquidity, supply" },
      { label: "Structure", note: "Reserves, cash management, guarantees" },
      { label: "Credit memo", note: "Risks and mitigants" }
    ]}
  },
  {
    id: "re-debt-037",
    track: "re",
    module: "re-debt",
    topic: "Lockboxes",
    level: 1,
    type: "qa",
    q: "What's the difference between a hard, soft and springing lockbox?",
    a: "They differ in who collects the rent. With a hard lockbox, tenants pay straight into an account the lender controls. With a soft lockbox, the borrower or manager collects rent and deposits it into that account. A springing lockbox stays inactive until a trigger, such as a DSCR drop or a default, puts the lender in control.",
    why: "Cash control protects the lender before problems become defaults. Tenants paying the lender directly can't be diverted, so hard lockboxes suit properties with a few large tenants, like office, retail and industrial. Where rent arrives in many small payments, as in multifamily and hotels, the borrower has to collect it first, so soft lockboxes are the norm. Springing structures give a healthy borrower freedom and let the lender tighten control only when performance slips, which is why many loans use some springing feature.",
    trap: "Don't confuse the lockbox with cash management. The lockbox decides who collects the rent; cash management decides where it goes next, and a trigger can trap or sweep the excess cash instead of releasing it to the borrower."
  },
  {
    id: "re-debt-038",
    track: "re",
    module: "re-debt",
    topic: "Cash sweeps",
    level: 2,
    type: "qa",
    q: "What is a cash sweep, and what triggers one?",
    a: "A cash sweep traps excess cash after debt service and reserves, instead of paying it to the borrower, once a trigger is hit: typically DSCR or debt yield falling below a set level, a default or a major tenant leaving. The cash is held as collateral or pays down the loan until the metric recovers.",
    why: "Sweep triggers sit above default levels on purpose. If NOI slips, the lender wants cash retained while the loan is still performing, not after it defaults. Stopping distributions also pressures the sponsor to fix the problem, since its cash flow is cut off. Terms vary: some loans hold the cash in a reserve released once the metric recovers, often after two consecutive quarters above the trigger; others apply it to principal. Borrowers can often cure early by paying down enough of the loan, or posting a letter of credit, to get back above the trigger.",
    formula: "Minimum NOI = trigger DSCR × annual debt service\nCure paydown = loan − (NOI ÷ trigger DSCR) ÷ constant",
    example: "Loan [[$30M]], interest-only at [[6.5%]]: debt service $1.95M. The sweep trigger is DSCR below [[1.15x]], so NOI must stay at or above $2.24M. NOI falls to [[$2.10M]]: DSCR is 1.08x, and cash is swept. To cure, the loan must fall to $28.1M, a paydown of about $1.9M.",
    trap: "Terms matter here: a cash trap holds the money and releases it once the property recovers, while a true sweep prepays the loan for good. Borrowers prefer the trap, because the cash can come back."
  },
  {
    id: "re-debt-039",
    track: "re",
    module: "re-debt",
    topic: "Cash management waterfall",
    level: 3,
    type: "walk",
    q: "Walk me through the monthly cash management waterfall in a typical CMBS loan.",
    a: "Rent lands in the lockbox and moves to a cash management account. From there it pays, in order: the tax and insurance escrows, senior debt service, required reserves such as replacement and TI/LC, operating expenses under the approved budget and mezzanine debt service if there is any. What's left is excess cash: released to the borrower normally, but trapped or swept after a trigger.",
    why: "The order ranks what protects the lender. Taxes and insurance come first because unpaid taxes become a lien ahead of the mortgage and an uninsured loss destroys the collateral. Debt service ranks ahead of operating expenses, but the budget is funded every month the cash covers it, so the property keeps running. Reserves are funded before the borrower sees a dollar. Mezz debt service sits below everything the senior lender cares about, which is its structural subordination in practice. With springing cash management, this waterfall applies only after a trigger; before that, cash can flow to the borrower.",
    trap: "The follow-up: does a senior cash trap stop the mezz lender getting paid? Usually not, unless the senior loan is in default: mezz debt service sits above the excess cash line. Details vary, so read the cash management agreement.",
    visual: { kind: "flow", steps: [
      { label: "Lockbox", note: "Rents collected" },
      { label: "Taxes and insurance", note: "Monthly escrow deposits" },
      { label: "Senior debt service" },
      { label: "Reserves", note: "Replacement, TI/LC" },
      { label: "Operating expenses", note: "Per the approved budget" },
      { label: "Mezzanine debt service" },
      { label: "Excess cash", note: "To the borrower, or trapped after a trigger" }
    ]}
  },
  {
    id: "re-debt-040",
    track: "re",
    module: "re-debt",
    topic: "Extension tests",
    level: 2,
    type: "qa",
    q: "A $40M bridge loan has two one-year extension options subject to an 8.0% debt yield test. NOI at initial maturity is $3.0M. Can the borrower extend?",
    a: "Not as is. The debt yield is $3.0M ÷ $40M = 7.5%, below the 8.0% test. To extend, the borrower must pay the loan down to $37.5M, a $2.5M paydown, then pay the extension fee and buy a new rate cap. Otherwise it must refinance, sell or negotiate with the lender at initial maturity.",
    why: "Extension options aren't free rights; they're conditional. Typical conditions: no default, an extension fee (often a fraction of a percent of the balance), a new or extended rate cap and a performance test such as a minimum debt yield or DSCR. The test protects the lender from carrying a business plan that's failing: if NOI hasn't grown as projected, the sponsor must put in fresh equity to extend. That's why sponsors model the extension test at underwriting, not just the initial maturity.",
    formula: "Maximum loan to extend = NOI ÷ required debt yield\nPaydown = current balance − maximum loan",
    example: "Loan [[$40M]], NOI [[$3.0M]], test [[8.0%]] debt yield: maximum loan $3.0M ÷ 8.0% = $37.5M, so a $2.5M paydown. With a [[0.25%]] fee on the remaining balance, the extension costs about $94K plus the new cap.",
    trap: "The follow-up: what does a '3+1+1' structure mean? A three-year initial term plus two one-year extensions, and each extension usually has its own test, sometimes a stricter one.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "Current balance", value: 40.0 },
      { label: "Maximum at 8.0% debt yield", value: 37.5, highlight: true }
    ]}
  },
  {
    id: "re-debt-041",
    track: "re",
    module: "re-debt",
    topic: "Refinancing risk",
    level: 2,
    type: "qa",
    classic: true,
    q: "A $30M bridge loan matures with NOI of $2.4M. A permanent lender offers 65% LTV at a 6.5% cap rate, 1.25x DSCR at a 7.25% constant and an 8% debt yield. Does the loan refinance?",
    a: "Not fully. Size the takeout like any new loan and take the lowest test: LTV gives $24.0M, DSCR $26.5M and debt yield $30.0M. The takeout is $24.0M against a $30M balance, a $6.0M gap the sponsor must cover with new equity, mezz or preferred equity. That gap is refinancing risk.",
    why: "The existing loan was sized on yesterday's assumptions; the takeout is sized on today's NOI, rates and cap rates, and it has to be at least as big as the balance you owe. Here debt yield is fine, but a 6.5% cap rate puts value at about $36.9M, so LTV binds. That's why the exit gets tested at origination on all three ratios, with room for higher rates and cap rates. The business plan has to grow NOI into the takeout.",
    formula: "Takeout = lowest of LTV × NOI ÷ cap rate, (NOI ÷ DSCR) ÷ constant and NOI ÷ debt yield\nFunding gap = balance owed − takeout",
    trap: "The gap isn't the end of the story: the sponsor may pay it to protect the equity above the loan. At about $36.9M of value, a $6.0M check keeps about $6.9M of equity the sponsor would otherwise lose.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "LTV", value: 24.0, highlight: true },
      { label: "DSCR", value: 26.5 },
      { label: "Debt yield", value: 30.0 },
      { label: "Balance owed", value: 30.0 }
    ], caption: "Takeout tests against the $30M balance" }
  },
  {
    id: "re-debt-042",
    track: "re",
    module: "re-debt",
    topic: "Maturity default",
    level: 2,
    type: "qa",
    classic: true,
    q: "What happens when a loan can't be refinanced at maturity?",
    a: "It's a maturity default unless the borrower finds another path. Options include an extension if the tests are met, a paydown with new equity (a cash-in refinance), rescue capital such as preferred equity, a sale and a negotiated modification. If none works, the lender may accept a discounted payoff or take the property.",
    why: "A maturity default is different from a payment default: the property may be performing fine but can't support a new loan as large as the old one. Neither side wants a foreclosure if the asset is sound, so a common outcome is a negotiated extension, often in exchange for a paydown, a cash sweep, higher reserves or a fee. The market calls the bad version 'extend and pretend': pushing out maturity in the hope that values recover. The sponsor's choice turns on whether the equity above the loan is worth the new money needed to keep it.",
    trap: "The follow-up: why would a lender extend rather than foreclose? Foreclosure is slow and costly, the lender becomes an owner it may not want to be and a sale into a weak market can crystallize a bigger loss than waiting."
  },
  {
    id: "re-debt-043",
    track: "re",
    module: "re-debt",
    topic: "Break-even occupancy",
    level: 2,
    type: "qa",
    q: "What is break-even occupancy, and why do lenders look at it?",
    a: "Break-even occupancy is the occupancy at which the property's income just covers operating expenses and debt service: (operating expenses + debt service) ÷ potential gross income. Lenders use it as a cushion test: the further it sits below market occupancy, the more vacancy the property can absorb before it can't pay the loan from its own cash flow.",
    why: "DSCR tells you coverage at today's occupancy; break-even occupancy tells you how far occupancy can fall before coverage hits 1.0x, which is easier to compare with market vacancy and past downturns. It rises with leverage and with high fixed costs, which is why a highly leveraged building with heavy taxes and insurance is fragile. The simple formula treats all expenses as fixed; since some costs fall with occupancy, it slightly overstates the true break-even. Some lenders also include reserves or leasing costs, so say which version you use.",
    formula: "Break-even occupancy = (operating expenses + debt service) ÷ potential gross income",
    example: "Potential gross income [[$5.0M]], operating expenses [[$2.0M]], debt service [[$1.8M]]. Break-even occupancy = $3.8M ÷ $5.0M = 76%. If the market runs at [[93%]] occupancy, the property can lose 17 points of occupancy before cash flow stops covering the loan.",
    trap: "Occupancy isn't collections: concessions and bad debt mean a building can be 90% occupied and still collect less. The follow-up: what's the break-even with no debt? Operating expenses ÷ potential gross income, 40% here; the difference is the cost of leverage."
  },
  {
    id: "re-debt-044",
    track: "re",
    module: "re-debt",
    topic: "Cash-out refinance",
    level: 2,
    type: "qa",
    classic: true,
    q: "How does a cash-out refinance work, and why would a sponsor do one?",
    a: "Once the business plan has raised NOI and value, the sponsor takes out a new, larger loan sized on the higher value, uses it to repay the old loan and costs, then distributes the rest. Investors get capital back early and keep the property. The cost: more leverage, higher debt service and prepayment fees on the old loan.",
    why: "A cash-out refi lets investors harvest value without selling, which boosts IRR because cash comes back sooner. In the US, loan proceeds generally aren't taxable income, so unlike a sale it doesn't trigger capital gains tax. The equity left in the deal is small or even negative, so ongoing returns on it look very high, but the property now carries more debt: DSCR is lower and there's less cushion if values fall. Lenders size the new loan on current NOI and value, so the cash-out is only as big as the value the plan has proved.",
    example: "Bought for [[$20.0M]] with a [[$13.0M]] loan, so $7.0M of equity. After the renovation NOI is [[$2.0M]]; at a [[6.0%]] cap the property is worth $33.3M. A new [[65%]] LTV loan of $21.7M repays the $13.0M loan and [[$0.4M]] of costs, leaving $8.3M to distribute: more than the $7.0M invested.",
    trap: "Check the other tests: the new loan must also clear DSCR and debt yield (9.2% here), and the old loan's prepayment cost comes out of the proceeds. The refi raises the deal's risk along with its IRR.",
    visual: { kind: "stack", unit: "$M", dp: 1, columns: [
      { title: "Uses", items: [
        { label: "Repay old loan", value: 13.0 },
        { label: "Costs", value: 0.4 },
        { label: "Cash to investors", value: 8.3, highlight: true }
      ]},
      { title: "Sources", items: [
        { label: "New loan", value: 21.7 }
      ]}
    ]}
  },
  {
    id: "re-debt-045",
    track: "re",
    module: "re-debt",
    topic: "Recapitalizations",
    level: 2,
    type: "qa",
    q: "What is a recapitalization in real estate, and why would a sponsor do one?",
    a: "A recap restructures who funds the property without selling it. A debt recap refinances, often with cash out; an equity recap brings in a new investor to buy out existing partners or add capital. Sponsors use recaps to return capital, let an LP exit, crystallize a promote or rescue a loan that can't refinance.",
    why: "A recap lets the sponsor keep control and keep executing the business plan while changing the capital behind it. The property is valued at the recap, usually by negotiation or appraisal, and that value runs through the existing waterfall, so the exiting LP gets paid and the sponsor can earn its promote as if the property had sold. Rescue recaps work differently: new money, often preferred equity, pays down debt in exchange for a senior position in the equity, diluting the existing investors. A recap usually costs less than a sale, though an exiting partner still owes tax on its gain.",
    trap: "The follow-up: who's on each side? The sponsor sits on both: it helps set the value the exiting LP receives and may earn a promote on it, so LPs often insist on an appraisal or a market test to manage that conflict.",
    visual: { kind: "table", headers: ["Type", "How", "Why"], rows: [
      ["Debt recap", "Refinance, often with cash out", "Return capital, keep the asset"],
      ["Equity recap", "New investor buys out partners", "Let an LP exit; crystallize the promote"],
      ["Rescue recap", "New money pays down debt", "Close a refinancing gap"]
    ]}
  },
  {
    id: "re-debt-046",
    track: "re",
    module: "re-debt",
    topic: "Special servicing",
    level: 2,
    type: "qa",
    q: "What does a special servicer do in CMBS, and when does a loan get transferred to one?",
    a: "The special servicer manages troubled CMBS loans for the bondholders. A loan transfers from the master servicer on a trigger such as a payment default (typically 60 days), a maturity default, a bankruptcy or imminent default. It then picks whatever maximizes recovery for the trust on a present-value basis: modification, extension, discounted payoff, note sale or foreclosure.",
    why: "The master servicer handles routine work on performing loans: collecting payments, managing escrows and advancing missed payments to bondholders while it expects to recover them. It can't agree to real changes. The special servicer can, but it must follow a servicing standard: act for the bondholders as a whole, choosing the option with the highest net present value of recovery. It earns fees for workouts and liquidations, and it's usually appointed by the controlling class, often the B-piece holder, whose position is hit first. That creates potential conflicts, which the servicing rules try to police.",
    trap: "For the borrower, a transfer changes the conversation: the special servicer is a workout specialist, charges fees, may seek a receiver and has no relationship to protect. Some borrowers default on purpose to reach it, since the master servicer can't modify."
  },
  {
    id: "re-debt-047",
    track: "re",
    module: "re-debt",
    topic: "Workout options",
    level: 2,
    type: "qa",
    q: "What are a lender's main options when a CRE loan gets into trouble?",
    a: "From most to least cooperative: forbearance; a modification, such as a lower rate, an interest-only period or an A/B note split; an extension; a discounted payoff; a note sale; a deed-in-lieu; or foreclosure, often with a receiver. The lender picks whichever recovers the most in present value.",
    why: "Every option is judged against the foreclosure alternative: today's value, minus the time, legal costs, carrying costs and sale discount of taking the property, discounted back. If the property is sound and the sponsor is competent, keeping it in place, often with fresh equity, a paydown or a cash sweep in exchange for relief, usually recovers more. If the sponsor has given up or is the problem, the lender moves to take control. An A/B split keeps a loan sized to today's value current while preserving a 'hope note' that pays only if the property recovers.",
    trap: "The follow-up: why not always foreclose? Foreclosure can take many months, or years in some states, the property often deteriorates meanwhile and the lender ends up owning and selling a building, which isn't its business.",
    visual: { kind: "table", headers: ["Option", "What happens", "Borrower keeps it?"], rows: [
      ["Forbearance", "Lender holds off enforcing for a time", "Yes"],
      ["Modification", "Rate, amortization or structure changed", "Yes"],
      ["Extension", "Maturity pushed out, often for a paydown", "Yes"],
      ["Discounted payoff", "Lender accepts less than it's owed", "Yes, if it refinances"],
      ["Note sale", "Lender sells the loan to a new investor", "For now"],
      ["Deed-in-lieu", "Borrower hands over title", "No"],
      ["Foreclosure", "Property sold or taken by the lender", "No"]
    ]}
  },
  {
    id: "re-debt-048",
    track: "re",
    module: "re-debt",
    topic: "Discounted payoffs",
    level: 3,
    type: "qa",
    q: "What is a discounted payoff, and why would a lender accept one?",
    a: "A discounted payoff retires the loan for less than the balance, with the lender forgiving the rest. The lender accepts when the payoff beats what it would net by foreclosing: foreclosure takes time, costs money and ends in a sale at an uncertain price, so the comparison is with the present value of that path, not today's appraisal.",
    why: "The lender compares two cash flows. Foreclosure means months or years of legal costs, a receiver, carrying costs, property decline and a sale discount, all before any cash comes back; discounting that recovery at the lender's required return often puts it well below the property's current value. That leaves room for a DPO priced between the lender's foreclosure value and the property's value, which works for both sides. The borrower usually funds it with a new loan plus fresh equity. Lenders worry about moral hazard, so they want evidence the borrower can't simply pay and often want the sponsor's own new money in.",
    example: "Loan [[$40M]]; the property is worth [[$30M]]. Foreclosing takes about [[18]] months and [[$1.5M]] of costs, then a sale at [[$30M]] less [[3%]] selling costs nets $27.6M. Discounted at [[10%]] a year, that's about $23.9M today. A [[$27.0M]] DPO beats it by about $3.1M, and the sponsor keeps a $30M property for $27.0M.",
    trap: "Watch the tax: in the US the forgiven $13.0M can be taxable cancellation-of-debt income to the borrower's owners unless an exception applies, which can make a DPO costly for them.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "Loan balance", value: 40.0 },
      { label: "Property value", value: 30.0 },
      { label: "DPO", value: 27.0, highlight: true },
      { label: "Foreclosure, present value", value: 23.9 }
    ]}
  },
  {
    id: "re-debt-049",
    track: "re",
    module: "re-debt",
    topic: "Note sales",
    level: 3,
    type: "qa",
    q: "Why would a lender sell a non-performing loan instead of working it out or foreclosing?",
    a: "To get cash and certainty now. A note sale moves the problem off the lender's books, frees capital and avoids months or years of foreclosure risk and cost. The buyer, often a distressed debt fund, pays a discount to the balance and steps into the lender's rights, then works the loan out or forecloses, sometimes to own the property.",
    why: "Banks in particular face capital charges and regulatory scrutiny on non-performing loans, and a workout ties up specialist staff for a long time. Selling crystallizes the loss but ends the uncertainty. The buyer prices the note off the collateral: expected recovery minus time, costs and its target return, which is often high. A buyer planning to 'loan-to-own' gets the lender's remedies, including the right to credit bid its full claim at a foreclosure sale, which can be a cheaper path to the property than buying it outright. Guarantees and a cooperative borrower raise what a note is worth.",
    example: "Note balance [[$20M]], property worth about [[$15M]]. A fund expects to foreclose in [[2]] years, spend [[$1.0M]] on costs and sell for [[$15M]], netting $14.0M. Discounted at its [[15%]] target return, that's worth about $10.6M today: 53 cents on the dollar.",
    trap: "The follow-up: why would a bank sell for $10.6M a note secured by a $15M property? It compares the sale with its own time- and risk-adjusted recovery, not today's value, and it often values speed and certainty more than a fund does."
  },
  {
    id: "re-debt-050",
    track: "re",
    module: "re-debt",
    topic: "Deed-in-lieu vs foreclosure",
    level: 2,
    type: "qa",
    q: "What's the difference between a deed-in-lieu of foreclosure and a foreclosure?",
    a: "In a deed-in-lieu, the borrower hands title to the lender, usually in exchange for a release from some or all liability. It's faster and cheaper than foreclosure. But the lender takes title subject to any junior liens, which a foreclosure would wipe out. Foreclosure is a court-supervised or trustee sale that clears junior interests but can take months or years.",
    why: "The deed-in-lieu works when both sides want out quickly: the borrower avoids a public foreclosure and negotiates relief from guarantees, and the lender gets the keys without legal delay, before the property deteriorates further. Its risks are why lenders sometimes insist on foreclosing anyway: junior liens, like a second mortgage or a judgment, survive, and the transfer could be challenged if the borrower later files for bankruptcy. Foreclosure timing depends on the state: judicial foreclosure goes through the courts and can take a year or more; non-judicial foreclosure under a power of sale is much faster. A receiver often runs the property meanwhile.",
    trap: "The follow-up: what does the borrower ask for in return? A release of the carve-out guarantees, or at least a covenant not to sue. When junior liens are a worry, the parties may instead agree to a consensual 'friendly foreclosure' that clears them."
  },
  {
    id: "re-debt-051",
    track: "re",
    module: "re-debt",
    topic: "A/B notes and participations",
    level: 3,
    type: "qa",
    q: "What are A/B notes and loan participations, and how does a B-note differ from mezzanine debt?",
    a: "Both split one mortgage loan among lenders. A/B notes divide it into a senior A-note and a junior B-note, both secured by the same mortgage, with losses hitting the B-note first. A participation sells shares of a loan through a lead lender. Unlike mezz, a B-note is secured by the property, not the ownership interests.",
    why: "Splitting a loan lets each piece go to the investor that wants its risk: the A-note often goes into CMBS or to a conservative lender, the B-note to a higher-yield buyer. The borrower sees one loan and one rate. Because a B-note holder shares the mortgage, it has no separate UCC foreclosure right; its protection comes from the co-lender agreement, often including cure rights, a purchase option and control rights while it's still 'in the money'. Participations spread a large loan across lenders, but participants depend on the lead lender to administer it.",
    example: "A [[$100M]] loan at [[6.55%]] is split into a [[$70M]] A-note at [[5.50%]] and a [[$30M]] B-note at [[9.00%]]: $3.85M + $2.70M = $6.55M of interest, exactly what the borrower pays. If a foreclosure sale nets [[$80M]], the A-note is repaid in full and the B-note recovers $10M of its $30M.",
    trap: "Don't confuse A/B notes with pari passu notes: pari passu notes split a loan into equal-ranking pieces, often placed in different CMBS deals, while A/B notes rank senior and junior."
  },
  {
    id: "re-debt-052",
    track: "re",
    module: "re-debt",
    topic: "Loan assumptions",
    level: 2,
    type: "qa",
    q: "A seller's $30M loan at 4.0% has five years left, and new debt would cost 6.5%. Why might a buyer assume the loan, and what's involved?",
    a: "To keep the cheap debt: at 4.0% rather than 6.5%, interest runs $750K a year lower, about $3.1M in present value over five years. The seller avoids a prepayment penalty too. The catch: the lender must approve the buyer, charges a fee (often around 1%) and wants a new guarantor, and the loan may not fit the plan.",
    why: "Below-market debt is an asset, and the seller will try to capture it in the price. Its value is roughly the present value of the interest savings at today's market rate, less the assumption fee. Many fixed-rate loans, including most CMBS and agency loans, allow an assumption because the loan stays in place, but the lender re-underwrites the buyer as a new borrower: experience, net worth and liquidity. The drawbacks: the loan amount is fixed, so a buyer paying more than the seller did may need more equity or supplemental financing, and the remaining term may be shorter than the hold.",
    example: "Assumed loan [[$30M]] at [[4.0%]], interest-only, [[5]] years left; new debt at [[6.5%]]. Savings: $750K a year, worth about $3.1M today at 6.5%. A [[1%]] assumption fee ($300K) leaves about $2.8M of value, which the seller will try to capture in the price.",
    trap: "The follow-up: how do you reflect the loan in your bid? Model returns with the assumed debt and with a new loan; the difference in value is the most you can pay the seller for the loan."
  },
  {
    id: "re-debt-053",
    track: "re",
    module: "re-debt",
    topic: "Lockouts and step-downs",
    level: 1,
    type: "qa",
    q: "Besides yield maintenance and defeasance, how else can a loan limit prepayment?",
    a: "With a lockout, a period when the loan can't be prepaid; a step-down, a penalty that falls each year, such as 5%, 4%, 3%, 2% then 1% of the balance; spread maintenance or minimum interest on floating-rate loans; and exit fees. Many loans also have an open period near maturity, often the last few months, when prepayment is free.",
    why: "Each structure protects the lender's expected return in a different way. A lockout guarantees a minimum life, which securitized lenders value. A step-down is simple and predictable, common on bank and some agency loans, but unlike yield maintenance it ignores rates, so it can over- or under-compensate the lender. Spread maintenance makes a floating-rate borrower who repays early pay the spread for the rest of a minimum period, since the lender lost margin, not a fixed coupon. The open period lets the borrower refinance at maturity without a penalty.",
    example: "[[$20M]] loan with a [[5-4-3-2-1]] step-down, repaid in year [[3]]: the penalty is 3% × $20M = $600K. On a floating-rate loan with [[12]] months of spread maintenance at a [[3.00%]] spread, repaying after [[8]] months costs 3.00% × $20M × 4/12 = $200K.",
    trap: "The follow-up: why do CMBS loans lock out prepayment at the start? Tax rules for the trust generally bar defeasance within two years of securitization, so the lockout covers that window.",
    visual: { kind: "table", headers: ["Structure", "How it works", "Common on"], rows: [
      ["Lockout", "No prepayment for a period", "CMBS"],
      ["Yield maintenance", "Pay the lender's lost interest", "Life companies, agencies"],
      ["Defeasance", "Swap in Treasuries", "CMBS"],
      ["Step-down", "Fixed % that falls each year", "Banks, some agency loans"],
      ["Spread maintenance", "Pay the spread for a minimum period", "Floating-rate loans"],
      ["Open period", "Free prepayment near maturity", "Most fixed-rate loans"]
    ]}
  },
  {
    id: "re-debt-054",
    track: "re",
    module: "re-debt",
    topic: "Fees and all-in yield",
    level: 2,
    type: "qa",
    q: "A $30M bridge loan is priced at SOFR plus 350 bps with a 1% origination fee and a 0.5% exit fee. If it's repaid after two years, what's the lender's all-in spread?",
    a: "Roughly 4.25% over SOFR. The fees total 1.5% of the loan, $450K, and spread over a two-year life they add about 75 bps a year to the 3.50% spread. The shorter the loan's life, the more the fees add per year, which is why lenders care so much about how long a bridge loan stays outstanding.",
    why: "Lenders think in yield, not just coupon. Origination fees are paid at closing, so they're a bigger boost when the loan is repaid quickly; exit fees add yield whenever the loan is repaid and are sometimes waived if the same lender provides the takeout. Comparing loans on coupon alone misses this: a lower spread with higher fees can cost the borrower more on a short hold. The straight-line method ignores time value; a proper yield calculation comes out slightly higher, because the origination fee is collected upfront.",
    formula: "All-in spread ≈ spread + (origination fee + exit fee) ÷ expected life in years",
    example: "[[$30M]] at SOFR + [[3.50%]], a [[1%]] origination fee ($300K) and a [[0.5%]] exit fee ($150K). Repaid after [[2]] years: the fees add 1.5% ÷ 2 = 0.75% a year, an all-in spread of about 4.25%. Repaid after [[1]] year: about 5.00%. After [[3]] years: about 4.00%.",
    trap: "The follow-up: which is cheaper, a 3.25% spread with 2% of fees or a 3.75% spread with 1%? Over one year the second (4.75% vs 5.25%); over four years the first (3.75% vs 4.00%)."
  },
  {
    id: "re-debt-055",
    track: "re",
    module: "re-debt",
    topic: "Whole loan vs senior and mezz",
    level: 3,
    type: "qa",
    q: "Which is cheaper for a $75M financing: a whole loan at 7.0%, or a $60M senior loan at 6.0% plus $15M of mezz at 11.0%?",
    a: "On blended cost, neither: the senior-plus-mezz stack costs ($3.6M + $1.65M) ÷ $75M = 7.0%, the same as the whole loan. So the choice turns on structure: one lender and one set of documents versus two lenders, an intercreditor and a mezz lender that can foreclose quickly on the equity. Prepayment terms, flexibility and execution certainty usually decide it.",
    why: "Blended cost is the weighted average of the pieces' rates, and competing lenders tend to price the two routes to similar blends. The better test is marginal cost: compared with a $60M senior loan at 6.0%, either option makes the extra $15M cost 11.0% ($5.25M − $3.6M = $1.65M a year). That only raises the equity's expected return if the property's unlevered return beats 11.0%. Beyond cost, a whole loan gives one counterparty in a workout, while a split stack adds a mezz lender with a faster remedy but may let the sponsor repay the expensive piece early.",
    trap: "The follow-up: why use 11% mezz on a property returning less? To shrink the equity check and stretch limited capital, accepting negative leverage on that slice, or because the business plan's expected return is well above the in-place yield.",
    visual: { kind: "table", headers: ["", "Whole loan", "Senior + mezz"], rows: [
      ["Debt", "[[$75M]] at [[7.0%]]", "[[$60M]] at [[6.0%]] + [[$15M]] at [[11.0%]]"],
      ["Annual interest", "$5.25M", "$3.60M + $1.65M = $5.25M"],
      ["Blended rate", "7.0%", "7.0%"],
      ["Cost of the last $15M", "11.0%", "11.0%"],
      ["Lenders", "One", "Two, plus an intercreditor"]
    ]}
  }
]);
