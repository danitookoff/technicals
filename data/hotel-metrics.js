Deck.add([
  {
    id: "hotel-metrics-001",
    track: "hotel",
    module: "hotel-metrics",
    topic: "Occupancy, ADR and RevPAR",
    level: 1,
    type: "qa",
    classic: true,
    q: "What are occupancy, ADR and RevPAR, and how do they fit together?",
    a: "Occupancy is rooms sold divided by rooms available. ADR, average daily rate, is rooms revenue divided by rooms sold. RevPAR, revenue per available room, is rooms revenue divided by rooms available, which equals occupancy × ADR. RevPAR is the headline metric because it captures both volume and price.",
    why: "Occupancy alone can be bought by cutting rates, and ADR alone can be propped up by turning guests away, so neither tells you whether the rooms business is healthy. RevPAR combines them into one number that's comparable across hotels of different sizes. When RevPAR moves, the next question is always which component drove it, because that decides how much reaches profit.",
    formula: "Occupancy = rooms sold ÷ rooms available\nADR = rooms revenue ÷ rooms sold\nRevPAR = rooms revenue ÷ rooms available = occupancy × ADR",
    example: "A [[200]]-key hotel over a [[30]]-day month has 6,000 rooms available. It sells [[4,800]] for [[$1.08M]] of rooms revenue. Occupancy 80%, ADR $225, RevPAR $180 (80% × $225).",
    trap: "RevPAR only covers rooms revenue. For full-service hotels with big food, beverage and events businesses, also look at TRevPAR (total revenue per available room) and GOPPAR, which measure the whole operation."
  },
  {
    id: "hotel-metrics-002",
    track: "hotel",
    module: "hotel-metrics",
    topic: "Penetration indices",
    level: 2,
    type: "qa",
    classic: true,
    q: "What do MPI, ARI and RGI tell you?",
    a: "They compare a hotel with its competitive set. MPI (occupancy index) is your occupancy ÷ the comp set's. ARI (rate index) is your ADR ÷ the comp set's. RGI (RevPAR index) is your RevPAR ÷ the comp set's. Each is multiplied by 100, so 100 means you're getting exactly your fair share.",
    why: "Absolute numbers mix hotel performance with market conditions: RevPAR down 5% in a year the market fell 10% is actually a win. Indexing to a comp set strips out the market and isolates how well the hotel competes. RGI is the summary; MPI and ARI show how it's winning or losing. Management agreement performance tests often use RGI, so owners watch it closely.",
    formula: "MPI = occupancy ÷ comp set occupancy × 100\nARI = ADR ÷ comp set ADR × 100\nRGI = RevPAR ÷ comp set RevPAR × 100 = MPI × ARI ÷ 100",
    example: "Hotel: [[78.0%]] occupancy at [[$210]]. Comp set: [[72.0%]] at [[$220]]. MPI 108.3, ARI 95.5, RGI 103.4. The hotel beats its fair share by filling rooms at a discount, which is worth questioning, since rate usually flows through to profit better.",
    trap: "Owners and operators choose the comp set, and a weak one flatters RGI. The follow-up: what makes a good comp set? Similar location, chain scale, size, amenities and demand segments.",
    visual: { kind: "table", headers: ["", "Hotel", "Comp set", "Index"], rows: [
      ["Occupancy", "[[78.0%]]", "[[72.0%]]", "MPI 108.3"],
      ["ADR", "[[$210]]", "[[$220]]", "ARI 95.5"],
      ["RevPAR", "$163.80", "$158.40", "RGI 103.4"]
    ]}
  },
  {
    id: "hotel-metrics-003",
    track: "hotel",
    module: "hotel-metrics",
    topic: "ADR-led vs occupancy-led growth",
    level: 2,
    type: "qa",
    q: "Is RevPAR growth driven by ADR better than growth driven by occupancy?",
    a: "Usually, yes. A higher rate on the same number of rooms costs almost nothing extra, so most of it reaches profit. Extra occupancy brings real costs with every occupied room: housekeeping, laundry, amenities, utilities and commissions. The same RevPAR gain produces more profit when it comes from ADR.",
    why: "Hotel costs scale with occupied rooms, not with the price charged. Each occupied room triggers cleaning labor, linens, supplies and often a distribution cost. Raising ADR adds revenue without adding occupied rooms, so flow-through is high. Occupancy gains still matter (they bring food and beverage spend and build loyalty), and in a weak market filling rooms may be the only option, but owners prefer rate-led growth.",
    example: "Base: [[75%]] occupancy at [[$200]], RevPAR $150. Raise ADR [[5%]] to $210: RevPAR $157.50, and profit rises about $7.50 per available room per night. Reach the same RevPAR with 78.75% occupancy at $200 instead: at [[$45]] of cost per occupied room, profit rises only about $5.81.",
    trap: "Rate gains aren't entirely free: commissions, card fees, and management and franchise fees are charged as a percentage of revenue. That's why flow-through on rate-led growth is high but below 100%.",
    visual: { kind: "bars", unit: "$", dp: 2, items: [
      { label: "ADR-led", value: 7.50, highlight: true },
      { label: "Occupancy-led", value: 5.81 }
    ], caption: "Profit gain per available room per night from the same $7.50 RevPAR increase" }
  }
]);
