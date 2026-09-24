Deck.add([
  {
    id: "hotel-val-001",
    track: "hotel",
    module: "hotel-val",
    topic: "From GOP to NOI",
    level: 2,
    type: "qa",
    classic: true,
    q: "How do you get from a hotel's GOP to the NOI you'd capitalize?",
    a: "Subtract management fees (base and any incentive), then fixed charges like property taxes and insurance, to reach EBITDA. Then subtract an FF&E reserve, commonly around 4% of total revenue, to get EBITDA less reserve: the NOI buyers usually capitalize. Use a market management fee even if the owner self-manages.",
    why: "Buyers value the cash flow the real estate produces after paying someone to run it and after setting money aside to keep it competitive. Furniture, fixtures and equipment wear out every several years, so a hotel that skips the reserve is borrowing from future capital spending. Deducting the reserve and a market fee makes NOI comparable across owners, and across hotels that are brand-managed or franchised.",
    example: "Total revenue [[$30.0M]], GOP [[$10.5M]]. Base fee of [[3%]] of revenue: $0.9M. Taxes and insurance: [[$1.2M]]. EBITDA $8.4M. FF&E reserve of [[4%]]: $1.2M. NOI $7.2M. At an [[8.0%]] cap that's $90M, or $300K per key across [[300]] keys.",
    trap: "The reserve convention varies: some quote cap rates on EBITDA before reserve, and new hotels often ramp the reserve from 1–2% up to 4% over several years. Always state which NOI a cap rate applies to.",
    visual: { kind: "waterfall", unit: "$M", dp: 1, start: { label: "GOP", value: 10.5 }, steps: [
      { label: "Base management fee", delta: -0.9 },
      { label: "Property taxes and insurance", delta: -1.2 },
      { label: "EBITDA", subtotal: true },
      { label: "FF&E reserve", delta: -1.2 }
    ], end: { label: "NOI after reserve", value: 7.2 } }
  }
]);
