Deck.add([
  {
    id: "re-val-001",
    track: "re",
    module: "re-val",
    topic: "Cap rate",
    level: 1,
    type: "qa",
    classic: true,
    q: "What is a cap rate?",
    a: "The cap rate is NOI divided by value or price: the first-year unlevered yield a buyer earns. A property with $1.2M of NOI bought for $24M trades at a 5% cap rate. A lower cap rate means a higher price for the same income.",
    why: "Cap rates let you compare properties of different sizes the way a multiple compares companies, and they're the inverse of an NOI multiple: a 5% cap rate is 20x NOI. Buyers accept a low cap rate when they see little risk or expect NOI to grow, and demand a high one when income is shaky or growth is weak. That's why a cap rate is a pricing convention, not a total return.",
    formula: "Cap rate = NOI ÷ value\nValue = NOI ÷ cap rate",
    example: "NOI [[$1.2M]], price [[$24M]]: cap rate = $1.2M ÷ $24M = 5.0%. If cap rates rise to [[5.5%]], the same NOI is worth $1.2M ÷ 5.5% = $21.8M, a 9% drop in value.",
    trap: "Always ask which NOI: trailing, forward or pro forma. Brokers often quote a cap rate on projected NOI, which makes the price look cheaper than it is on income you can see today."
  },
  {
    id: "re-val-002",
    track: "re",
    module: "re-val",
    topic: "What drives cap rates",
    level: 2,
    type: "qa",
    classic: true,
    q: "What makes cap rates go up or down?",
    a: "Cap rates move with the return investors require and the growth they expect: roughly, cap rate ≈ required return − NOI growth. Higher interest rates, more risk (weak tenants, short leases, poor location, older buildings) or weaker growth push cap rates up. Cheaper capital, safer income and stronger growth push them down.",
    why: "A property is a growing stream of NOI, so the Gordon growth formula applies: value = NOI ÷ (r − g), which makes the cap rate r − g. The required return r rises with interest rates and risk; growth g rises with rent growth and pricing power. So two buildings with identical NOI can trade at very different cap rates: the one with long leases to strong tenants in a supply-constrained market has less risk and often more growth.",
    formula: "Cap rate ≈ r − g\nr = required unlevered return, g = long-run NOI growth",
    example: "An investor wants an [[8.0%]] unlevered return and expects [[3.0%]] annual NOI growth, so a cap rate of about 5.0% works. If expected growth falls to [[2.0%]], the cap rate rises to about 6.0%, and value falls by about 17% for the same NOI.",
    trap: "Cap rates don't move one-for-one with interest rates. The spread between cap rates and Treasury yields widens and narrows, and growth expectations can offset rate moves, so don't say rates up 100 bps means cap rates up 100 bps.",
    visual: { kind: "table", headers: ["Pushes cap rates up", "Pushes cap rates down"], rows: [
      ["Higher interest rates", "Lower interest rates"],
      ["Short leases, weak tenants", "Long leases, strong credit"],
      ["Weak rent growth, new supply", "Strong rent growth, little supply"],
      ["Older asset, secondary market", "Newer asset, core location"]
    ]}
  },
  {
    id: "re-val-003",
    track: "re",
    module: "re-val",
    topic: "Going-in vs exit cap",
    level: 2,
    type: "qa",
    classic: true,
    q: "Why do you usually assume an exit cap rate above the going-in cap rate?",
    a: "It's conservatism. At exit the building is older and needs more capital, the next buyer faces its own uncertainty, and you don't want your return to depend on cap rates falling. A common rule of thumb adds about 5–10 bps per year of hold, or roughly 25–50 bps over five years.",
    why: "Exit value is forward NOI ÷ exit cap, and in a five-year hold the sale is often half or more of your total return. Holding the cap rate flat quietly bets that the market and the building's competitiveness stay where they are today. Nudging the exit cap up builds in some aging of the asset and some reversion in pricing, so the deal still works if the sale market is weaker.",
    example: "Going in at [[5.25%]], five-year hold, year 6 NOI of [[$2.20M]]. At a [[5.75%]] exit cap the sale price is $38.3M; at [[5.25%]] it's $41.9M. That half point is worth $3.6M, about 9% of the price, which is why exit cap is one of the first sensitivities to run.",
    trap: "The follow-up: when could the exit cap be lower than the going-in? A value-add plan that turns a tired, half-leased asset into a renovated, stabilized one can justify it, but you need a specific reason."
  },
  {
    id: "re-val-004",
    track: "re",
    module: "re-val",
    topic: "Sale proceeds",
    level: 2,
    type: "qa",
    q: "How do you calculate the sale proceeds at the end of a hold?",
    a: "Take the following year's NOI and divide by the exit cap rate to get the gross sale price. Subtract selling costs (broker fees, transfer taxes, legal), often assumed at 1–3% of price. For the equity's proceeds, also repay the loan balance.",
    why: "A buyer at exit pays for the income it will receive, which is the next year's NOI, not the income you already collected. Selling costs are real cash out of the sale, and on large deals they can erase a year of NOI growth. For equity returns, the remaining loan balance comes off the top because the lender is paid first.",
    formula: "Gross sale price = NOI(year N+1) ÷ exit cap\nNet proceeds = gross price × (1 − selling costs)\nEquity proceeds = net proceeds − loan balance",
    example: "Year 6 NOI [[$2.20M]], exit cap [[5.75%]]: gross price $38.3M. Selling costs of [[2%]] leave $37.5M. Repay the [[$22.0M]] loan balance: equity proceeds of $15.5M.",
    trap: "Using year 5 NOI (the last year you own it) understates value. And if year 6 NOI is distorted, say by a big lease rolling that year, normalize it before capping it."
  }
]);
