Deck.add([
  {
    id: "re-dev-001",
    track: "re",
    module: "re-dev",
    topic: "Yield on cost",
    level: 2,
    type: "qa",
    classic: true,
    q: "What is yield on cost, and how does it compare with the market cap rate?",
    a: "Yield on cost is stabilized NOI divided by total project cost: the cap rate you're effectively building at. Compare it with the cap rate the finished property would sell at. The gap is the development spread, and it has to be wide enough to pay for construction, lease-up and market risk.",
    why: "If you can build at a 6.5% yield and similar stabilized buildings sell at 5.25%, you're creating something worth more than it cost: value is NOI ÷ market cap rate, cost is NOI ÷ yield on cost. The spread is your margin for things going wrong: cost overruns, slower lease-up, lower rents, or cap rates rising before you sell. Developers often look for something like 100–200 bps, depending on product type and risk.",
    formula: "Yield on cost = stabilized NOI ÷ total project cost\nDevelopment spread = yield on cost − market cap rate",
    example: "Total cost [[$50M]], stabilized NOI [[$3.25M]]: yield on cost 6.5%. At a [[5.25%]] market cap rate the finished property is worth $61.9M. Spread 125 bps; profit $11.9M, or 24% on cost.",
    trap: "Yield on cost uses stabilized NOI, not year-one NOI during lease-up. And the spread has to survive a higher exit cap: rerun it with the cap rate 50 bps wider.",
    visual: { kind: "bars", unit: "$M", dp: 1, items: [
      { label: "Total cost", value: 50.0 },
      { label: "Stabilized value", value: 61.9, highlight: true }
    ], caption: "Value at a 5.25% cap rate on $3.25M of NOI" }
  },
  {
    id: "re-dev-002",
    track: "re",
    module: "re-dev",
    topic: "Development budget",
    level: 2,
    type: "walk",
    q: "Walk me through a development budget and how it's funded.",
    a: "Uses: land, hard costs (the physical construction), soft costs (design, permits, legal, insurance), financing costs including capitalized interest, a contingency, and often a developer fee. Sources: equity goes in first, then a construction loan funds the rest, sized on loan-to-cost. Lenders want the sponsor's money at risk before theirs.",
    why: "Construction lenders fund last because a half-built project is poor collateral. With equity spent first, the lender knows the sponsor has absorbed the early risk and is committed to finishing. Interest during construction is usually capitalized (added to the loan or paid from an interest reserve) because there's no income yet. The contingency covers overruns, and hard-cost overruns are one of the main ways developments fail.",
    example: "Land [[$8.0M]], hard costs [[$30.0M]], soft costs [[$6.0M]], contingency [[$1.5M]], financing and capitalized interest [[$3.0M]], developer fee [[$1.5M]]: total $50.0M. A [[60%]] loan-to-cost construction loan funds $30.0M; equity funds $20.0M.",
    trap: "Capitalized interest depends on the loan balance, which grows as the project draws, so it's circular in a model. Expect the follow-up on estimating it: average outstanding balance × rate × build period.",
    visual: { kind: "stack", unit: "$M", dp: 1, columns: [
      { title: "Uses", items: [
        { label: "Land", value: 8.0 },
        { label: "Hard costs", value: 30.0 },
        { label: "Soft costs", value: 6.0 },
        { label: "Contingency", value: 1.5 },
        { label: "Financing and interest", value: 3.0 },
        { label: "Developer fee", value: 1.5 }
      ]},
      { title: "Sources", items: [
        { label: "Sponsor equity", value: 20.0 },
        { label: "Construction loan", value: 30.0, highlight: true }
      ]}
    ]}
  }
]);
