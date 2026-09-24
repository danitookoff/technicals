Deck.add([
  {
    id: "re-basics-001",
    track: "re",
    module: "re-basics",
    topic: "How real estate makes money",
    level: 1,
    type: "primer",
    q: "Primer: how a real estate investment makes money",
    a: "A property earns rent. Take away the costs of running it and you get net operating income (NOI), the property's cash profit before debt and capital spending. Buyers value that income with a cap rate: value = NOI ÷ cap rate. Most buyers borrow part of the price, so the equity earns what's left after debt service, plus the property's value when it's sold. Returns come from three places: income, NOI growth, and the cap rate at exit.",
    why: "Cap rate: the first-year yield an all-cash buyer accepts (NOI ÷ price). Debt service: interest plus any principal payments on the loan. Levered: bought partly with debt. Exit or reversion: the sale at the end of the hold. Stabilized: leased and operating at a normal, sustainable level.",
    visual: { kind: "flow", steps: [
      { label: "Rent and other income", note: "What tenants pay" },
      { label: "NOI", note: "Income less operating expenses" },
      { label: "Value", note: "NOI ÷ cap rate" },
      { label: "Equity", note: "Value less debt" },
      { label: "Equity return", note: "Cash flow after debt service, plus the sale" }
    ]}
  },
  {
    id: "re-basics-002",
    track: "re",
    module: "re-basics",
    topic: "Real estate vs corporate finance",
    level: 1,
    type: "qa",
    classic: true,
    q: "How is real estate investing different from corporate finance?",
    a: "You're valuing one asset with contractual leases, not a whole company. NOI replaces EBITDA and cap rates replace multiples. Value rests on cash income, so depreciation doesn't drive it. Debt sits at the property level, and returns depend heavily on leverage and the exit price. Capital items like tenant improvements and leasing commissions sit below NOI.",
    why: "A company's cash flow comes from selling products into an uncertain future, so bankers lean on EBITDA multiples and DCFs. A building's cash flow is largely written into leases, so you can underwrite it line by line from the rent roll. A cap rate is just an inverted NOI multiple: a 5% cap rate is 20x NOI. The asset is also physical and finite: it needs capital to stay competitive, and it's usually financed with a mortgage on that one property.",
    trap: "Don't claim depreciation is irrelevant. It doesn't drive property value, but it shelters taxable income, which is one reason investors like owning real estate.",
    visual: { kind: "table", headers: ["", "Corporate", "Real estate"], rows: [
      ["Income measure", "EBITDA", "NOI"],
      ["Pricing shorthand", "EV/EBITDA multiple", "Cap rate (NOI ÷ value)"],
      ["Where cash flow comes from", "Selling products", "Leases"],
      ["Debt", "Company-level", "Mortgage on the property"]
    ]}
  },
  {
    id: "re-basics-003",
    track: "re",
    module: "re-basics",
    topic: "Investment strategies",
    level: 1,
    type: "qa",
    classic: true,
    q: "What are core, core-plus, value-add and opportunistic strategies?",
    a: "They're risk buckets. Core is stabilized, well-located property with low leverage, bought for steady income. Core-plus adds modest upside or leverage. Value-add buys assets with fixable problems (vacancy, dated units, weak management) and fixes them. Opportunistic takes the most risk: development, distress or heavy repositioning, with the highest leverage and target returns.",
    why: "Each step up moves more of the return from today's income to future appreciation, which depends on executing a business plan and selling well. That's less certain, so investors demand more, and sponsors usually add leverage to get there. The bucket tells you how to underwrite: a core deal lives or dies on the cap rate and rent growth; a value-add deal on renovation cost, rent premiums and lease-up time.",
    trap: "Return targets aren't fixed. Quote them as rough ranges that move with interest rates. A common follow-up: which bucket is a half-vacant office building? Value-add or opportunistic, depending on how much work it needs.",
    visual: { kind: "table", headers: ["Strategy", "Business plan", "Leverage", "Target levered IRR"], rows: [
      ["Core", "Hold stable income", "Up to about 40%", "About 6–8%"],
      ["Core-plus", "Light upside", "About 40–60%", "About 8–11%"],
      ["Value-add", "Renovate, re-lease", "About 60–70%", "About 11–15%"],
      ["Opportunistic", "Develop, rescue, reposition", "70% or more", "15% or more"]
    ], caption: "Rough ranges for illustration. They shift with rates and the cycle." }
  },
  {
    id: "re-basics-004",
    track: "re",
    module: "re-basics",
    topic: "Fee simple vs ground lease",
    level: 2,
    type: "qa",
    q: "What's the difference between owning a property fee simple and owning it on a ground lease?",
    a: "Fee simple means you own the land and the building outright. On a ground lease you own the building but rent the land for a long term, paying ground rent. It lowers your upfront cost, but you give up the land's value, and the remaining lease term caps what the building is worth.",
    why: "A ground lease splits the investment in two: the land owner gets a very secure, bond-like income stream, and the building owner (the leasehold) needs less equity. The catch is time. When the lease ends, the building usually reverts to the land owner, so a leasehold is a wasting asset. Lenders get uneasy once the remaining term nears the loan's maturity plus a cushion, and buyers pay less for short leaseholds. Scheduled rent resets can squeeze the leasehold too.",
    trap: "The follow-up: is ground rent above or below NOI? For the building owner it's an operating cost, so it comes out before NOI. Also know subordinated vs unsubordinated: whether the land owner lets a mortgage take priority over its land.",
    example: "A leasehold with [[90]] years left finances and trades close to fee simple value. With [[30]] years left, few lenders will make a 10-year loan with 30-year amortization, and buyers discount the price heavily."
  }
]);
