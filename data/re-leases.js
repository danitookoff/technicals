Deck.add([
  {
    id: "re-leases-001",
    track: "re",
    module: "re-leases",
    topic: "Lease types",
    level: 1,
    type: "qa",
    classic: true,
    q: "What's the difference between a gross lease, a modified gross lease and a triple net lease?",
    a: "They differ in who pays operating expenses. In a gross lease the landlord pays them out of a higher rent. In a triple net (NNN) lease the tenant pays its share of taxes, insurance and maintenance on top of base rent. Modified gross sits between: typically the tenant pays increases above a base year.",
    why: "The lease type decides who bears expense risk. Under a gross lease, if taxes or insurance jump, the landlord's NOI falls. Under NNN, those increases pass through to tenants, and the landlord's income behaves more like a bond. That's why you can't compare rents across lease types directly: a $30 NNN rent and a $42 gross rent can be the same deal if expenses run $12 per square foot.",
    trap: "In NNN leases, check for caps on controllable expense increases and which costs are excluded. The follow-up is often how a base year works when expenses rise in year two.",
    visual: { kind: "table", headers: ["Lease type", "Tenant pays", "Expense risk"], rows: [
      ["Gross", "Rent only", "Landlord"],
      ["Modified gross", "Rent plus increases over a base year", "Shared"],
      ["Triple net (NNN)", "Rent plus its share of taxes, insurance and maintenance", "Tenant"]
    ]}
  },
  {
    id: "re-leases-002",
    track: "re",
    module: "re-leases",
    topic: "Net effective rent",
    level: 2,
    type: "qa",
    classic: true,
    q: "How do you calculate net effective rent?",
    a: "Start with the total rent over the lease, subtract the landlord's concessions (free rent, the tenant improvement allowance and usually leasing commissions), and spread what's left over the term. That's the rent the landlord really earns per year. A more precise version discounts each cash flow first.",
    why: "Two leases with the same face rent can be very different deals. A tenant getting 12 months free and a big TI package pays far less than the headline number. Net effective rent puts packages on one basis so you can compare proposals, track real rent growth in a market, and see whether rising face rents are just being given back as concessions.",
    formula: "NER = (total rent − free rent − TI − leasing commissions) ÷ lease years\nPer square foot, per year",
    example: "A [[10]]-year lease at [[$40]]/SF flat: total rent $400/SF. Less [[12]] months free ($40), TI of [[$50]]/SF and commissions of [[5%]] of rent collected ($18). Net: $292/SF over 10 years = $29.20/SF a year, 27% below face.",
    trap: "Tenants and brokers often quote NER counting only free rent. Ask whose view it is and whether it's discounted. Discounting lowers NER here, because TI and commissions are paid up front while rent arrives over time."
  }
]);
