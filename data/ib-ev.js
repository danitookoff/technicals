Deck.add([
  {
    id: "ib-ev-001",
    track: "ib",
    module: "ib-ev",
    topic: "Enterprise vs equity value",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between enterprise value and equity value?",
    a: "Equity value is what the company's shares are worth: the part that belongs to common shareholders. Enterprise value is what the core business is worth to everyone who funds it: equity plus debt, preferred stock and noncontrolling interests, minus cash. It's roughly what a buyer pays for the operations, free of how they're financed.",
    why: "Two companies with identical operations can have very different equity values if one carries more debt, so equity value mixes the business with its financing. Enterprise value strips the financing out: add every claim that ranks alongside or ahead of common equity, and subtract cash because it isn't needed to run the operations. That's why EV pairs with metrics measured before interest, like EBITDA.",
    formula: "EV = equity value + debt + preferred stock + NCI − cash\nPlus or minus leases, pensions and equity investments, by convention",
    example: "Share price [[$40]] × [[20M]] diluted shares = $800M of equity value. Add debt of [[$300M]], preferred of [[$50M]] and NCI of [[$30M]]; subtract cash of [[$180M]]. EV = $1,000M.",
    trap: "Use diluted shares, not basic. The follow-up: which transactions change equity value but not EV? Issuing shares for cash and paying a dividend both move equity value and cash by the same amount.",
    visual: { kind: "waterfall", unit: "$M", dp: 0, start: { label: "Equity value", value: 800 }, steps: [
      { label: "Debt", delta: 300 },
      { label: "Preferred stock", delta: 50 },
      { label: "Noncontrolling interest", delta: 30 },
      { label: "Cash", delta: -180 }
    ], end: { label: "Enterprise value", value: 1000 } }
  },
  {
    id: "ib-ev-002",
    track: "ib",
    module: "ib-ev",
    topic: "Why subtract cash",
    level: 2,
    type: "qa",
    classic: true,
    q: "Why do you subtract cash when calculating enterprise value?",
    a: "Because enterprise value measures the core business, and cash isn't part of it. A buyer of the whole company gets the cash too, which effectively lowers the price of the operations. Subtracting it also keeps EV consistent with EBITDA, which excludes the interest income cash earns.",
    why: "Think of buying a house with $10K in a drawer: you'd pay $10K more, but the house itself is worth the same. Cash is a non-operating asset that could be distributed or used to repay debt. Subtracting it lets you compare businesses regardless of how much cash each happens to hold. The same logic applies to other non-operating assets, like investments unrelated to the business.",
    trap: "Not all cash is excess. Cash trapped overseas, restricted cash, or the minimum needed to run the business is arguably operating, and some bankers subtract only excess cash. Raise the nuance if the interviewer pushes."
  },
  {
    id: "ib-ev-003",
    track: "ib",
    module: "ib-ev",
    topic: "What changes EV",
    level: 2,
    type: "qa",
    q: "A company raises $100 of debt and uses it to buy back stock. What happens to enterprise value and equity value?",
    a: "Enterprise value doesn't change, and equity value falls by $100. Debt rises $100 and equity value drops $100 as shares are retired, so the two cancel in EV. The operations are identical, so their value shouldn't change; only the split between debt and equity holders does.",
    why: "EV is the value of the operations, and a recapitalization doesn't touch the operations. Walk the bridge: equity value −$100, debt +$100, cash unchanged. In practice the share price might move (fewer shares, more financial risk, a new interest tax shield), but the standard interview answer holds everything else constant.",
    example: "Before: equity value [[$800M]], debt [[$300M]], cash [[$100M]], so EV is $1,000M. After a [[$100M]] debt-funded buyback: equity value $700M, debt $400M, cash $100M, and EV is still $1,000M.",
    trap: "If the company just holds the new debt as cash, neither value changes: debt and cash both rise $100. If it pays a $100 dividend from existing cash, equity value falls $100 and EV stays flat."
  }
]);
