Deck.add([
  {
    id: "ib-wacc-001",
    track: "ib",
    module: "ib-wacc",
    topic: "WACC",
    level: 1,
    type: "qa",
    classic: true,
    q: "How do you calculate WACC?",
    a: "Weight each source of capital by its share of the capital structure at market value and multiply by its cost: the cost of equity from CAPM, the after-tax cost of debt, and the cost of preferred if there is any. Add them up. It's the blended return all capital providers require, which is why it discounts unlevered free cash flow.",
    why: "Unlevered free cash flow belongs to every capital provider, so the discount rate must reflect all their required returns in proportion to their stakes. Debt is cheaper than equity because it's paid first and its interest is tax-deductible, which is why it enters after tax. Use market values, ideally a target or peer capital structure, because the discount rate should reflect the financing the business will carry over the long term.",
    formula: "WACC = E/V × cost of equity + D/V × cost of debt × (1 − t) + P/V × cost of preferred\nCost of equity = risk-free rate + β × equity risk premium",
    example: "Equity [[$600M]], debt [[$400M]]. Risk-free rate [[4.0%]], beta [[1.2]], equity risk premium [[5.5%]]: cost of equity 10.6%. Pre-tax cost of debt [[6.5%]] at a [[25%]] tax rate: 4.9% after tax. WACC = 60% × 10.6% + 40% × 4.9% = 8.3%.",
    trap: "Don't use book values or the coupon on old debt. The cost of debt is today's yield on the company's debt, or what it would pay to borrow now."
  }
]);
