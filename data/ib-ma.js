Deck.add([
  {
    id: "ib-ma-001",
    track: "ib",
    module: "ib-ma",
    topic: "Accretion shortcut",
    level: 2,
    type: "qa",
    classic: true,
    q: "How can you tell quickly whether an acquisition will be accretive?",
    a: "Compare the target's earnings yield at the purchase price (its net income ÷ the price paid) with the acquirer's after-tax cost of funds. If the yield is higher, the deal is accretive. The cost of stock is the acquirer's earnings yield (1 ÷ P/E); of cash, the forgone after-tax interest; of debt, the after-tax interest rate.",
    why: "Accretion asks whether the acquirer's EPS goes up. Buying the target adds its earnings; paying for it costs something. Issuing stock dilutes EPS at the acquirer's own earnings yield, spending cash gives up interest income, and new debt adds interest expense, each after tax. If what you buy earns more per dollar than what you pay per dollar, EPS rises. The shortcut ignores synergies, fees and new amortization from the purchase price allocation, so it's a first pass.",
    formula: "Target earnings yield = target net income ÷ purchase equity value\nCost of stock = 1 ÷ acquirer P/E\nCost of debt = interest rate × (1 − tax rate)",
    example: "Acquirer at a [[20x]] P/E: a 5.0% earnings yield. Target bought at [[15x]] its earnings: a 6.7% yield. All stock is accretive, since 6.7% > 5.0%. Debt at [[6%]] with a [[25%]] tax rate costs 4.5% after tax, so it's even more accretive.",
    trap: "Accretive doesn't mean value-creating: a deal can lift EPS just because debt is cheap while overpaying for the target. For mixed consideration, blend the costs by the share of each."
  }
]);
