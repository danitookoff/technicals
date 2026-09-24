Deck.add([
  {
    id: "re-noi-001",
    track: "re",
    module: "re-noi",
    topic: "GPR to NOI",
    level: 1,
    type: "walk",
    classic: true,
    q: "Walk me through how you get from gross potential rent to NOI.",
    a: "Start with gross potential rent: every unit leased at market rent all year. Subtract vacancy, credit loss and concessions to get net rental income, then add other income like parking and fees. That's effective gross income. Subtract operating expenses (taxes, insurance, utilities, repairs, payroll, management) to get NOI.",
    why: "GPR is the theoretical maximum, so every line after it explains why actual collections fall short. Vacancy is space nobody rents, credit loss is rent billed but never collected, and concessions are discounts like free months. Operating expenses are the costs of keeping the property running. Financing, the owner's income taxes and long-lived capital spending stay below NOI, which keeps NOI comparable across owners.",
    example: "A [[200]]-unit building at [[$2,000]] a month has GPR of $4.80M. Vacancy of [[5%]] ($240K), credit loss of [[1%]] ($48K) and [[$60K]] of concessions leave $4.45M; [[$150K]] of other income brings EGI to $4.60M. Operating expenses of [[$1.75M]] leave NOI of $2.85M.",
    trap: "Management fees are usually a percentage of EGI and belong in operating expenses even if the owner self-manages. Buyers add a market fee back in so NOI shows what any owner would pay.",
    visual: { kind: "waterfall", unit: "$K", start: { label: "Gross potential rent", value: 4800 }, steps: [
      { label: "Vacancy", delta: -240 },
      { label: "Credit loss", delta: -48 },
      { label: "Concessions", delta: -60 },
      { label: "Other income", delta: 150 },
      { label: "Effective gross income", subtotal: true },
      { label: "Operating expenses", delta: -1750 }
    ], end: { label: "NOI", value: 2852 } }
  },
  {
    id: "re-noi-002",
    track: "re",
    module: "re-noi",
    topic: "Above and below NOI",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's included in NOI, and what sits below it?",
    a: "NOI is all property revenue less the costs of operating the property: property taxes, insurance, utilities, repairs and maintenance, payroll and management fees. Below NOI sit debt service, capital expenditures, tenant improvements, leasing commissions, usually reserves, depreciation and the owner's income taxes.",
    why: "NOI is meant to measure what the real estate itself earns, whoever owns it and however it's financed. Debt service depends on the owner's loan, income taxes on the owner's structure, and depreciation is an accounting entry, so all three are excluded. Capital items like a roof, TI and leasing commissions are lumpy and long-lived, so they're shown separately rather than distorting one year's operating income.",
    trap: "Reserves are the gray area. Many owners show NOI before reserves, but lenders and appraisers often deduct them. Say which convention you're using, and only compare cap rates on the same basis."
  },
  {
    id: "re-noi-003",
    track: "re",
    module: "re-noi",
    topic: "Underwriting adjustments",
    level: 2,
    type: "qa",
    classic: true,
    q: "A seller's trailing NOI is $2.0M. Why might your underwritten NOI be lower?",
    a: "Because the seller's numbers reflect the seller's situation, not yours. The big adjustments: property taxes reset to your purchase price, insurance at today's premium, a market management fee even if the seller self-manages, one-time income stripped out, and vacancy at a market level. Together they can take a meaningful bite out of NOI.",
    why: "You're paying for the income a typical owner would earn from here on, so you rebuild NOI as if you already owned it. In many places a sale triggers a tax reassessment, so taxes jump when your price is well above the old assessed value. A self-managing seller shows no management fee, but you'd pay one or bear the cost yourself. And every dollar of NOI you miss gets overpaid at 1 ÷ cap rate.",
    example: "Seller NOI [[$2.00M]]. Taxes reset to [[1.2%]] of a [[$32M]] price: $384K vs [[$250K]] today, −$134K. Management at [[3%]] of [[$3.6M]] EGI: −$108K. Remove [[$40K]] of one-time lease termination income. Underwritten NOI ≈ $1.72M, 14% lower. At a [[6%]] cap that's about $4.7M less value.",
    trap: "Adjustments aren't only downward. If rents are below market and leases roll soon, expect the follow-up: how would you underwrite that upside, and how much of it would you pay the seller for?"
  },
  {
    id: "re-noi-004",
    track: "re",
    module: "re-noi",
    topic: "T-12, T-3 and pro forma",
    level: 2,
    type: "qa",
    q: "What's the difference between a T-12, an annualized T-3 and a pro forma?",
    a: "A T-12 is the actual trailing twelve months of operations. An annualized T-3 multiplies the last three months by four to capture the current run rate. A pro forma projects future operations under your assumptions. Lenders anchor on actuals; buyers and brokers often lean on projections.",
    why: "Each view trades accuracy for relevance. The T-12 is real and smooths seasonality, but it's stale if the property just leased up or raised rents. The T-3 catches recent momentum, so lenders often pair annualized recent revenue with trailing-twelve expenses, which are lumpier. The pro forma shows the business plan and is where optimism hides, so measure how far it sits from the T-12 and what has to happen to close the gap.",
    trap: "Watch T-3 annualization in seasonal assets like hotels or student housing: three strong months times four overstates the year. Ask which months are in the window."
  }
]);
