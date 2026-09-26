Deck.add([
  {
    id: "hotel-debt-001",
    track: "hotel",
    module: "hotel-debt",
    topic: "How hotel loans work",
    level: 1,
    type: "primer",
    q: "Primer: how hotel loans are sized and structured",
    a: "A hotel loan finances an operating business whose income reprices every night, so lenders lend less per dollar of NOI than on leased property and add structure. They size mainly on debt yield, using trailing NOI after a market management fee and an FF&E reserve, and want more coverage than apartment or office lenders. Reserves hold cash for replacements, brand-required upgrades and the off-season. Cash management springs on early triggers. And a comfort letter from the brand keeps the flag with the hotel if the borrower fails.",
    why: "Debt yield: NOI ÷ loan, the lender's income return if it took the hotel back. DSCR: NOI ÷ annual debt service. FF&E reserve: cash set aside, commonly about 4% of total revenue, to replace furniture, fixtures and equipment. PIP reserve: cash held at closing for upgrades the brand requires. Seasonality reserve: peak-season cash held back to cover off-season shortfalls. TTM: trailing twelve months. Cash trap: excess cash the lender holds once a trigger is hit. Comfort letter: the brand's agreement to let the lender keep the flag after a default. SASB: single-asset single-borrower CMBS, backed by one large loan.",
    visual: { kind: "table", headers: ["Hotel risk", "Lender's answer"], rows: [
      ["Income falls fast in a downturn", "Size on debt yield; higher DSCR"],
      ["Rooms and equipment wear out", "FF&E reserve"],
      ["Brand-required upgrades", "PIP reserve at closing"],
      ["Off-season losses", "Seasonality reserve; trailing tests"],
      ["Performance slips", "Cash trap triggers"],
      ["Losing the flag", "Franchise comfort letter"]
    ], caption: "Each hotel loan feature answers a hotel-specific risk." }
  },
  {
    id: "hotel-debt-002",
    track: "hotel",
    module: "hotel-debt",
    topic: "Debt yield for hotels",
    level: 1,
    type: "qa",
    classic: true,
    q: "Why do hotel lenders size loans mainly on debt yield rather than DSCR or LTV?",
    a: "Because it measures the loan against cash flow alone. Debt yield is NOI after the FF&E reserve divided by the loan, so rates, amortization and cap rates don't move it. DSCR looks strong whenever rates are low or the loan is interest-only; at a cycle peak, LTV rests on record NOI at a low cap rate.",
    why: "A lender's real question is what it earns if it ends up owning the hotel, and debt yield answers it directly: it's the cap rate at which the hotel is worth exactly the loan. Hotels need that anchor more than leased property does. Room rates reset nightly, so NOI can fall by a third or more in a recession. Hotel appraisals rest on fewer sales and mix in business value. And many hotel loans float, so DSCR at closing says little about next year's. So hotel lenders set a debt yield minimum first, usually higher than for other property types, then check DSCR and LTV.",
    formula: "Debt yield = NOI after FF&E reserve ÷ loan\nHighest cap rate at which value still covers the loan = debt yield × (1 − NOI decline)",
    example: "At an [[11%]] debt yield, the loan equals the hotel's value only if it trades at an 11% cap rate on today's NOI. If NOI then falls [[30%]], value still covers the loan at cap rates up to 7.7%. Sized at an [[8%]] debt yield instead, the same fall leaves the loan covered only up to a 5.6% cap rate.",
    trap: "The follow-up: can debt yield be flattered? Only through NOI. A record year lifts every test, which is why lenders size on trailing NOI with a market fee and a full reserve, sometimes normalized toward mid-cycle.",
    visual: { kind: "table", headers: ["NOI decline", "[[11%]] debt yield", "[[8%]] debt yield"], rows: [
      ["[[0%]]", "11.0%", "8.0%"],
      ["[[10%]]", "9.9%", "7.2%"],
      ["[[20%]]", "8.8%", "6.4%"],
      ["[[30%]]", "7.7%", "5.6%"]
    ], caption: "Highest cap rate at which the hotel is still worth the loan" }
  },
  {
    id: "hotel-debt-003",
    track: "hotel",
    module: "hotel-debt",
    topic: "Hotel DSCR and leverage",
    level: 1,
    type: "qa",
    classic: true,
    q: "Why do hotel loans usually require a higher DSCR and a lower LTV than apartment loans?",
    a: "Because hotel income is far less stable. With no leases, rates reset nightly, and high fixed costs make NOI fall much faster than revenue. A higher DSCR is a bigger cushion: at 1.25x, NOI can fall 20% before it stops covering debt service; at 1.60x, 37.5%. A lower LTV leaves room for values that swing with that income.",
    why: "A minimum DSCR is really a statement about how far NOI can fall before the borrower must pay debt service out of pocket. An apartment's rents change slowly, one lease at a time, so a thin cushion is enough. A hotel's NOI can drop by a third in a recession, and an owner facing losses may stop funding the hotel. So hotel minimums are set higher, and higher still for full-service hotels and resorts, whose fixed costs are heaviest. Illustratively, hotel lenders often want roughly 1.4x to 1.6x or more where apartment lenders accept around 1.25x, but levels vary by lender and over time.",
    formula: "Largest NOI fall before DSCR reaches 1.0x = 1 − 1 ÷ DSCR",
    example: "NOI falls [[35%]] in a recession. A loan closed at [[1.25x]] drops to 0.81x, so the owner must fund the shortfall or default. One closed at [[1.60x]] still just covers debt service, at 1.04x.",
    trap: "The follow-up: coverage at which rate? On floating-rate hotel loans, lenders often test DSCR at the rate cap's strike or a stressed rate rather than today's rate, so the cushion holds if SOFR rises.",
    visual: { kind: "bars", unit: "%", dp: 1, items: [
      { label: "1.25x DSCR", value: 20.0 },
      { label: "1.40x DSCR", value: 28.6 },
      { label: "1.60x DSCR", value: 37.5, highlight: true }
    ], caption: "How far NOI can fall before DSCR reaches 1.0x" }
  },
  {
    id: "hotel-debt-004",
    track: "hotel",
    module: "hotel-debt",
    topic: "Hotel cash management triggers",
    level: 2,
    type: "qa",
    q: "What typically triggers cash management on a hotel loan, and how do the triggers differ from an office loan's?",
    a: "A debt yield or DSCR on trailing-twelve-month NOI falling below a test set under the closing level, or a loan default, as on any property. Where an office loan adds triggers for a major tenant leaving, a hotel loan adds them for the brand and operator: the franchise terminated, in default or near expiry, or the manager terminated or bankrupt.",
    why: "The flag and the operator are to a hotel what a major tenant is to an office building: lose either and NOI is at risk, so the lender traps cash as soon as one is in doubt, often to fund a PIP or a replacement brand. The financial test trips well before the hotel can't pay, because hotel cash flow can slide within months. Collection differs too. Guests pay nightly and payroll can't wait, so under many management agreements the operator pays hotel costs, its fees and the FF&E reserve first and remits the rest. The lender controls net cash, not gross revenue, which makes early triggers more important.",
    trap: "Don't assume the trap ends as soon as NOI recovers. Trailing tests take quarters to reflect a recovery, and a trap set off by a franchise event lasts until a renewal or replacement flag is signed, however strong NOI is.",
    visual: { kind: "table", headers: ["Trigger", "Usual cure"], rows: [
      ["Trailing debt yield or DSCR below the test", "Back above it, often for two straight quarters"],
      ["Loan default", "Default cured"],
      ["Franchise terminated, in default or near expiry", "Renewal or an approved new brand, with the PIP reserved"],
      ["Manager terminated or bankrupt", "An approved replacement manager"]
    ], caption: "Illustrative; each loan defines its own triggers and cures." }
  },
  {
    id: "hotel-debt-005",
    track: "hotel",
    module: "hotel-debt",
    topic: "Lender FF&E reserves",
    level: 1,
    type: "qa",
    q: "How do hotel lenders handle the FF&E reserve?",
    a: "They deduct one when sizing the loan, commonly about 4% of total revenue, whether or not the owner funds it. Most also require monthly deposits into a lender-controlled account, released for approved replacements. Where the management agreement already has the operator reserving, lenders often accept that instead of a second deposit, as long as the operator keeps funding it.",
    why: "The reserve protects the collateral. A hotel that stops replacing carpets, beds and TVs loses rate and share, eventually even its flag, while its P&L looks fine for a while. Deducting a reserve in sizing also stops a borrower flattering NOI by under-reserving. Lenders typically use the higher of the contractual rate and their own minimum, so a new hotel whose management agreement ramps the reserve up from 1–2% is often underwritten at the full level anyway. And the account balance is extra collateral if the loan defaults.",
    example: "Revenue [[$30M]]: a [[4%]] reserve is $1.2M a year, $100K a month. The borrower's NOI deducts only a [[2%]] reserve, so it's $0.6M higher than the lender's. At an [[11%]] debt yield, that $0.6M would have supported about $5.5M of extra loan.",
    trap: "The follow-up: can the reserve pay debt service? Normally not, but in a sudden downturn lenders have let borrowers use it for debt service or operating costs, in exchange for replenishing it later. It's the lender's collateral, so any release is a negotiated concession."
  },
  {
    id: "hotel-debt-006",
    track: "hotel",
    module: "hotel-debt",
    topic: "PIP reserves at closing",
    level: 2,
    type: "qa",
    q: "You're financing a hotel purchase that comes with a $6.0M brand-required PIP. How will the lender handle the PIP at closing?",
    a: "It will collect a PIP reserve at closing, commonly 100% to 125% of the budget, and release it in draws as work is completed and inspected, often with a sponsor guarantee of completion. The lender wants the cash locked up first because an unfinished PIP can cost the hotel its flag, and with it much of the collateral's value.",
    why: "Missing a PIP deadline is a franchise default, and losing the flag usually defaults the loan too. So lenders take the funding risk off the table: the cash sits in a lender account with a cushion for overruns and is released only against completed work. A lender sizing on in-place NOI won't lend more because of the PIP, so it mostly adds to the equity check; bridge lenders may fund part of it as future funding and size on post-renovation NOI. Either way, the lender underwrites displacement: rooms out of service during the work cut NOI, sometimes for most of a year.",
    example: "The [[$6.0M]] PIP is reserved at [[110%]]: $6.6M at closing. The lender releases draws as each phase is completed and inspected. If the work finishes at [[$6.2M]] and the brand signs off, the last $0.4M goes back to the sponsor. Had it run to [[$7.0M]], the sponsor would have funded the extra $0.4M itself.",
    trap: "The follow-up: what if a PIP comes due mid-loan, say at a franchise renewal? Loans often trap cash ahead of the deadline to build the reserve, so a future PIP can cut distributions well before the work starts.",
    visual: { kind: "waterfall", unit: "$M", dp: 1, start: { label: "PIP reserve at 110%", value: 6.6 }, steps: [
      { label: "Draws for completed work", delta: -6.2 }
    ], end: { label: "Released at sign-off", value: 0.4 } }
  },
  {
    id: "hotel-debt-007",
    track: "hotel",
    module: "hotel-debt",
    topic: "Franchise comfort letters",
    level: 1,
    type: "qa",
    classic: true,
    q: "What is a franchise comfort letter, and why does a hotel lender insist on one?",
    a: "A letter from the brand to the lender. The brand agrees to report the borrower's franchise defaults and give the lender time to cure them. It also lets the lender, and often a foreclosure buyer, keep the flag, usually through a new franchise agreement on the existing terms. So the flag stays with the collateral if the borrower fails.",
    why: "The franchise agreement belongs to the borrower, and a default or a change of ownership would normally let the brand end it, just when the lender needs the hotel's value most. A hotel that loses its flag loses the brand's reservation system and loyalty program overnight, so the collateral could be worth far less. The letter bridges that gap. The brand still protects itself: the lender must pay unpaid fees, meet brand standards, often finish any outstanding PIP and elect within a set window after taking title. Later buyers usually need the brand's approval.",
    trap: "In CMBS, the letter has to run to the securitization trust, so lenders ask for one that can be assigned or reissued at securitization. The operator is a separate question, handled by the manager's subordination and non-disturbance terms.",
    visual: { kind: "flow", steps: [
      { label: "Borrower defaults", note: "Often behind on franchise fees too" },
      { label: "Brand notifies the lender", note: "The lender gets time to cure franchise defaults" },
      { label: "Lender takes title", note: "Foreclosure or deed-in-lieu" },
      { label: "Lender keeps the flag", note: "New agreement within the window; fees paid, standards met" }
    ]}
  },
  {
    id: "hotel-debt-008",
    track: "hotel",
    module: "hotel-debt",
    topic: "Franchise term vs loan term",
    level: 2,
    type: "qa",
    q: "A hotel's franchise expires two years before its loan matures. Why does the lender care, and what will it require?",
    a: "Because the flag is part of the collateral: if the franchise lapses, the hotel loses its brand demand, and renewals usually come with a PIP. The lender will want it extended past maturity at closing or, failing that, trap cash from a year or more before expiry until a renewal or replacement is signed, building cash for the PIP.",
    why: "The lender underwrote NOI with the brand's reservation and loyalty engine behind it, and at maturity a refinancing lender or buyer will want the same. A flag expiring mid-loan puts both at risk: the brand may decline to renew, perhaps in favor of a newer hotel nearby, or renew only with an expensive PIP, and an unbranded hotel is much harder to refinance. Trapping cash ahead of expiry funds the renewal from the hotel's own cash flow while the loan is still performing. Lenders often want the franchise to run a few years past maturity, so the next lender sees a secure flag too.",
    trap: "Treat it like a major lease rolling before maturity: the risk isn't only non-renewal but the price of renewing. A brand can use the renewal to demand a large PIP or new fees, just as a tenant bargains for a big TI package."
  },
  {
    id: "hotel-debt-009",
    track: "hotel",
    module: "hotel-debt",
    topic: "Reflagging during a loan",
    level: 2,
    type: "qa",
    q: "Partway through a loan, a hotel owner wants to switch brands. What will the lender require?",
    a: "Its consent first, since terminating or replacing the franchise without it is usually a default. Then a replacement brand it accepts with a new comfort letter, the conversion PIP reserved upfront, any liquidated damages to the old brand paid with equity and often a cash trap until the new flag is open and NOI has recovered.",
    why: "The loan was underwritten on the current brand's demand, so a reflag swaps a known income stream for a projected one. The switch is expensive: liquidated damages and the PIP upfront, then lost business while the new brand's reservation and loyalty channels build, which can take a year or more. The lender doesn't object to a reflag that raises value; it objects to paying for one with the loan's cash flow. So it makes the sponsor fund the transition, holds excess cash until results recover and wants a brand that a future lender or buyer would accept.",
    trap: "Don't forget the operator. At a brand-managed hotel the management agreement usually goes with the flag, so a reflag also means a new manager for the lender to approve, and possibly a termination fee on top of liquidated damages.",
    visual: { kind: "flow", steps: [
      { label: "Lender consent", note: "An unapproved change is usually a default" },
      { label: "Replacement brand", note: "One the lender accepts, with a new comfort letter" },
      { label: "Fund the switch", note: "Liquidated damages from equity; conversion PIP reserved" },
      { label: "Cash trap", note: "Until the new flag is open and NOI recovers" }
    ]}
  },
  {
    id: "hotel-debt-010",
    track: "hotel",
    module: "hotel-debt",
    topic: "Trailing tests for seasonal hotels",
    level: 2,
    type: "qa",
    q: "A ski hotel earns most of its NOI in winter. Why would its lender test DSCR on trailing-twelve-month NOI rather than monthly or quarterly results?",
    a: "Because a seasonal hotel's months swing from losses to large profits, so a monthly test, or an annualized quarter, would trip or pass on the calendar rather than on performance. Every trailing-twelve-month window holds one full season, so each test compares a whole year's NOI with a whole year's debt service. The cost: real declines show up slowly.",
    why: "A covenant should fire when the hotel is doing worse, not because it's June. A ski hotel's off-season months can lose money while it runs exactly to plan, and annualizing a winter quarter would hide a real problem. A trailing window rolls forward by dropping a period and adding the same period a year later, so each test compares like with like. The lag cuts both ways: a steady slide takes quarters to trip the test, and a recovery can take up to a year to lift a cash trap. Lenders pair trailing tests with a seasonality reserve, which handles the cash swings within the year.",
    example: "Quarterly NOI: winter [[$3.6M]], spring [[−$0.6M]], summer [[$0.2M]], autumn [[$1.8M]], so trailing NOI is $5.0M. Debt service is [[$3.2M]] against a [[1.30x]] test. Trailing, DSCR is 1.56x all year. Annualized quarter by quarter it reads 4.50x, −0.75x, 0.25x and 2.25x, failing twice a year on a hotel that's performing to plan.",
    trap: "Read the definition: some loans annualize the latest quarter or year to date, which suits a steady hotel, not a seasonal one. And a bad peak season hits a trailing test all at once, at the first test after it.",
    visual: { kind: "table", headers: ["", "NOI", "DSCR"], rows: [
      ["Winter, annualized", "[[$3.6M]]", "4.50x"],
      ["Spring, annualized", "[[−$0.6M]]", "−0.75x"],
      ["Summer, annualized", "[[$0.2M]]", "0.25x"],
      ["Autumn, annualized", "[[$1.8M]]", "2.25x"],
      ["Trailing 12 months", "$5.0M", "1.56x"]
    ], caption: "Debt service [[$3.2M]] a year against a [[1.30x]] test; a quarter annualized is its NOI × 4." }
  },
  {
    id: "hotel-debt-011",
    track: "hotel",
    module: "hotel-debt",
    topic: "Seasonality reserves",
    level: 1,
    type: "qa",
    q: "What is a seasonality reserve on a hotel loan, and how is it sized?",
    a: "It's cash the lender holds back from a seasonal hotel's strong months to pay debt service in months when cash flow falls short. It's sized from the monthly budget or history: add up each weak month's shortfall against debt service, often with a cushion, and collect it from peak-season cash, or at closing if the loan starts before the peak.",
    why: "Annual coverage can look comfortable while several months run short. A hotel with a 1.5x annual DSCR can still miss off-season payments if the owner has distributed the peak season's cash, and a single-asset borrower has nothing else to pay from. The reserve makes the hotel save for its own slow months. Deposits follow the calendar, collected in the strong months and released in the weak ones, and the schedule is reset each year against the new budget. It's a timing tool, not a sign of trouble: a healthy seasonal hotel can need one.",
    example: "Debt service is [[$250K]] a month. In five off-season months, cash flow before debt service is [[$150K]], [[$60K]], [[$20K]], [[$90K]] and [[$180K]]. The shortfalls are $100K, $190K, $230K, $160K and $70K: $750K in total. With a [[10%]] cushion, the lender collects $825K from the peak months.",
    trap: "Don't confuse it with a cash trap. A seasonality reserve collects on a schedule even when the hotel is healthy and pays out in the slow months; a cash trap holds all excess cash, and only after a trigger."
  },
  {
    id: "hotel-debt-012",
    track: "hotel",
    module: "hotel-debt",
    topic: "Hotel SASB CMBS",
    level: 3,
    type: "qa",
    q: "Why do owners of large hotels and hotel portfolios so often borrow through floating-rate SASB CMBS, and how do bond investors size the risk?",
    a: "Because the loans are too big for a conduit pool, and the owners, often private equity funds with three-to-five-year plans, want floating-rate debt that's cheap to prepay: commonly a two-year term plus one-year extensions. Investors underwrite the hotels directly, and rating agencies size each bond class on cash flow cut to a through-the-cycle level and a cap rate above market.",
    why: "A loan that would dominate a conduit pool is securitized alone, so every bond depends on the same hotels. That puts the stress test at the center: agencies cut hotel cash flow to what they think it can sustain through a downturn and value it conservatively, so the AAA class should be repaid even if the hotels sell far below today's appraisal. Floating rates suit sponsors who plan to renovate, reposition or sell within a few years, when defeasing fixed-rate debt would be costly. The price is structure: a rate cap, debt yield tests to extend and often mezzanine loans above the mortgage.",
    trap: "The follow-up: what changes with a portfolio? Each hotel carries an allocated loan amount, and selling one means repaying a release price above it, commonly around 105% to 120%, so the sponsor can't sell the best hotels and leave the lender the rest."
  },
  {
    id: "hotel-debt-013",
    track: "hotel",
    module: "hotel-debt",
    topic: "Taking back a hotel",
    level: 3,
    type: "qa",
    q: "Why is foreclosing on a hotel more complicated for a lender than foreclosing on an office building?",
    a: "Because the lender takes over a business, not just a building. It needs an operator from day one, usually a manager hired by a court-appointed receiver; the comfort letter to keep the flag; and a plan for the liquor license, which often can't simply transfer. It inherits staff, bookings and group contracts. The lender funds any losses meanwhile.",
    why: "An office building keeps collecting rent under its leases whoever owns it; a hotel has to sell its rooms again every night, so any disruption shows up in revenue at once. Guests, meeting planners and staff read a foreclosure as a warning, so bookings can slip just when the lender wants value preserved. That's why hotel lenders plan the takeover at origination: the comfort letter, manager subordination and liquor license arrangements come with the loan. It's also why many prefer a consensual path, such as a deed-in-lieu with the operator staying on, or a note sale, to a long contested foreclosure.",
    trap: "The follow-up: what happens after foreclosure? The lender usually owns the hotel for a while, run by a manager, and may have to fund deferred FF&E or a PIP to keep the flag before it can sell, so recovery takes time and new money.",
    visual: { kind: "table", headers: ["What the lender needs", "How it's usually handled"], rows: [
      ["Someone to run the hotel", "A receiver hires a manager"],
      ["The flag", "The comfort letter"],
      ["Alcohol sales", "An interim arrangement until a new license is issued"],
      ["Guests and staff", "Honor bookings; keep the team"],
      ["Cash for operating losses", "Advances from the lender"]
    ]}
  },
  {
    id: "hotel-debt-014",
    track: "hotel",
    module: "hotel-debt",
    topic: "Underwriting hotel NOI",
    level: 2,
    type: "qa",
    classic: true,
    q: "How does a hotel lender get from the borrower's NOI to the NOI it sizes the loan on?",
    a: "It starts from the trailing twelve months, not the budget, then charges a market management fee even if the owner self-manages, deducts a full FF&E reserve, updates taxes and insurance and strips out one-off income such as a big event. It gives no credit for projected RevPAR growth and may cap occupancy or share at what the comp set supports.",
    why: "The lender has no upside, so it sizes on what the hotel has already shown it can earn, run by someone the lender could hire. A self-managing owner's NOI leaves out a fee any buyer or receiver would pay, and owners often under-reserve before a sale or refinancing. Trailing results can still mislead: a peak year overstates sustainable NOI, and a hotel still ramping up after an opening or renovation understates it. Permanent lenders often take the lower of trailing and budgeted NOI, sometimes normalized toward mid-cycle; bridge lenders may lend against the plan, but at a lower going-in debt yield with reserves and extension tests.",
    example: "T-12 NOI [[$10.0M]] on [[$40.0M]] of revenue, self-managed, with a [[2%]] reserve. The lender charges a [[3%]] management fee, −$1.2M; takes the reserve to [[4%]], −$0.8M; removes a one-off convention, [[−$0.5M]]; and resets taxes to the purchase price, [[−$0.3M]]. Lender NOI: $7.2M. At an [[11%]] debt yield that supports $65.5M, against $90.9M on the borrower's figure.",
    trap: "Don't adjust twice. If the T-12 already carries a management fee or a full reserve, charge only the difference, and don't strip out recurring group business just because it's large: only true one-offs come out.",
    visual: { kind: "waterfall", unit: "$M", dp: 1, start: { label: "T-12 NOI", value: 10.0 }, steps: [
      { label: "Management fee at 3%", delta: -1.2 },
      { label: "Reserve from 2% to 4%", delta: -0.8 },
      { label: "One-off convention", delta: -0.5 },
      { label: "Taxes reset", delta: -0.3 }
    ], end: { label: "Lender NOI", value: 7.2 } }
  },
  {
    id: "hotel-debt-015",
    track: "hotel",
    module: "hotel-debt",
    topic: "Underwriting a hotel loan",
    level: 2,
    type: "walk",
    classic: true,
    q: "You're a lender looking at a $60M loan on a 250-key branded hotel. Walk me through your underwriting.",
    a: "Start with the market: demand drivers, new supply and the hotel's penetration of its comp set over several years. Rebuild trailing NOI into lender NOI after a market management fee and a full FF&E reserve. Size on debt yield, then check DSCR, LTV and $240K per key against replacement cost. Test the refinance at maturity. Review the brand (franchise term, PIP and comfort letter), the operator and the sponsor. Then set the structure: reserves, triggers and seasonality provisions.",
    why: "Each step answers a question the numbers alone can't. The market and penetration work shows whether today's NOI is sustainable or a peak, which matters more for a hotel than for leased property. Rebuilding NOI shows what a new owner or receiver would actually earn. Debt yield ties the loan to that cash flow rather than to rates or an appraisal, and loan per key tells you whether your basis would still look cheap if you had to own the hotel. The brand, operator and sponsor review checks the demand engine and who stands behind it. Structure covers what's left, such as a flag expiring before maturity.",
    trap: "The follow-up: what would you check first? The hotel's penetration trend. A hotel losing share is at risk even in a strong market, and one far above fair share may not keep it.",
    visual: { kind: "flow", steps: [
      { label: "Market", note: "Demand drivers, new supply, penetration trend" },
      { label: "Lender NOI", note: "Trailing NOI after a market fee and a full FF&E reserve" },
      { label: "Size", note: "Debt yield first; DSCR, LTV, loan per key, refinance" },
      { label: "Brand, operator and sponsor", note: "Franchise term, PIP, comfort letter, track record" },
      { label: "Structure", note: "Reserves, cash management triggers, seasonality" }
    ]}
  },
  {
    id: "hotel-debt-016",
    track: "hotel",
    module: "hotel-debt",
    topic: "Hotel construction loans",
    level: 2,
    type: "qa",
    q: "How does a construction loan on a new hotel differ from one on a new apartment building?",
    a: "It's riskier for the lender, so it's usually a lower share of cost with more protection: signed franchise and management agreements before closing, completion and carry guarantees and reserves for interest and early operating losses. A hotel opens empty, can't pre-lease and takes years to ramp, while its fixed costs run from day one.",
    why: "An apartment building leases unit by unit on contracted rents and often stabilizes within a year or two of opening. A hotel sells nights from scratch, builds occupancy and then rate over roughly three to four years and may lose money at first. With no pre-leasing to prove demand, the lender leans on a feasibility study, the brand's distribution and the operator. The budget also carries hotel-only items, such as FF&E, operating supplies and pre-opening costs, that are worth little in a foreclosure. So lenders want more equity, guarantees that carry the ramp-up and a takeout sized on stabilized debt yield.",
    trap: "The follow-up: what does the takeout lender need? A trailing year of stabilized results, which a new hotel may not have for years. So hotel construction loans often run longer or include extensions with debt yield tests.",
    visual: { kind: "table", headers: ["", "Apartments", "Hotel"], rows: [
      ["Pre-leasing", "Possible, unit by unit", "None: opens empty"],
      ["Ramp to stabilization", "Often 1–2 years", "Often 3–4 years"],
      ["Extra budget items", "Lease-up marketing", "FF&E, supplies, pre-opening"],
      ["Needed at closing", "Plans, permits, contract", "Also franchise and management agreements"],
      ["Leverage", "Higher share of cost", "Lower share, more guarantees"]
    ], caption: "Rough patterns; terms vary by lender, market and sponsor." }
  },
  {
    id: "hotel-debt-017",
    track: "hotel",
    module: "hotel-debt",
    topic: "Hotel loans in a downturn",
    level: 2,
    type: "walk",
    q: "Walk me through what happens to a leveraged hotel owner and its lender when a recession hits.",
    a: "RevPAR falls, and NOI falls two or three times as fast because most costs are fixed. As trailing results catch up, the debt yield or DSCR trigger trips and the lender traps excess cash. If NOI drops below debt service, the owner must fund the shortfall, sometimes operating losses too, or default. Then come workouts: forbearance, reserve relief, deferred FF&E deposits or an extension for a paydown. If the equity is gone, the owner hands back the hotel.",
    why: "The sequence runs fast because hotels have no leases: revenue drops within weeks, while trailing tests take quarters to catch up, so cash traps often arrive after the damage. The owner's choice turns on whether the equity is still worth funding: paying shortfalls makes sense only if value should recover above the loan before maturity. Lenders often prefer a sponsor who keeps funding to owning a money-losing hotel that needs an operator and could lose its flag. And brand standards don't pause: the franchise still expects upkeep and PIPs, which compete with debt service for scarce cash.",
    trap: "Don't assume the owner defaults once coverage breaks 1.0x. If the hotel is still worth more than the loan and a recovery looks likely, sponsors often fund shortfalls for a year or more to protect their equity.",
    visual: { kind: "flow", steps: [
      { label: "RevPAR falls", note: "Occupancy first, then rate" },
      { label: "NOI falls faster", note: "Fixed costs don't flex" },
      { label: "Cash trap", note: "Once trailing debt yield or DSCR breaks the trigger" },
      { label: "Shortfalls", note: "The owner funds debt service and losses, or defaults" },
      { label: "Workout", note: "Forbearance, reserve relief, extension for a paydown" },
      { label: "Handback", note: "Deed-in-lieu or foreclosure if the equity is gone" }
    ]}
  },
  {
    id: "hotel-debt-018",
    track: "hotel",
    module: "hotel-debt",
    topic: "Headroom to a cash trap",
    level: 3,
    type: "qa",
    q: "A hotel has $40.0M of revenue, $10.0M of NOI and a $90M loan that traps cash below a 9.0% debt yield. If 65% of lost revenue comes off NOI, how far can revenue fall before cash is trapped?",
    a: "About 7.3%. The trap springs below 9.0% × $90M = $8.1M of NOI, so the cushion is $1.9M, 19% of NOI. Each lost revenue dollar costs 65 cents of NOI, so revenue can fall only $2.9M, 7.3% of $40.0M. A modest RevPAR dip trips a trigger that looked comfortably far away.",
    why: "A 19% NOI cushion sounds comfortable, but hotel NOI moves two to three times as fast as revenue, because most costs stay when revenue leaves. So translate headroom into revenue: divide the NOI cushion by the NOI lost per revenue dollar. That's how lenders and asset managers track triggers, often as the RevPAR decline that would trip them, and why a trigger set a few points below the closing debt yield bites far sooner on a hotel than on an office. The trailing test adds a lag, so the trap usually springs a quarter or more after revenue starts falling.",
    formula: "Trigger NOI = trigger debt yield × loan\nRevenue cushion = (NOI − trigger NOI) ÷ NOI lost per revenue dollar",
    trap: "The follow-up: what if the fall is all rate? Room costs barely change, so nearly all lost revenue reaches NOI. At 85 cents per lost dollar, the cushion shrinks to $2.2M of revenue, 5.6%.",
    visual: { kind: "bars", unit: "%", dp: 1, items: [
      { label: "NOI cushion", value: 19.0 },
      { label: "Revenue cushion, 65% to NOI", value: 7.3, highlight: true },
      { label: "Revenue cushion, 85% to NOI", value: 5.6 }
    ], caption: "How far each can fall before the trap springs" }
  },
  {
    id: "hotel-debt-019",
    track: "hotel",
    module: "hotel-debt",
    topic: "Replacing the operator",
    level: 3,
    type: "qa",
    q: "When can a hotel lender make the owner replace the hotel's operator, and what limits that right?",
    a: "Typically in three cases: a loan default; the operator's own default or bankruptcy; or debt yield or DSCR staying below a set level, often for consecutive quarters. The replacement must be one the lender approves. The limit is the management agreement: many long brand contracts don't let the owner fire the operator for those reasons.",
    why: "At a hotel, the operator moves NOI more than any manager of leased property, so lenders want a way to change it before the loan fails. But the lender isn't a party to the management agreement; it can only require the borrower to terminate. So it negotiates at closing: third-party operators usually sign a subordination agreement accepting replacement on the lender's triggers, with any termination fee subordinate to the loan. Brand managers with long terms often refuse, leaving the lender to rely on the agreement's own performance test, a weaker position it weighs in sizing and structure.",
    trap: "Replacing an operator isn't free even when the contract allows it: transition costs, lost group business and, for a brand manager, possibly the flag itself. The right is often most valuable as leverage to get a performance plan."
  },
  {
    id: "hotel-debt-020",
    track: "hotel",
    module: "hotel-debt",
    topic: "Branded vs independent for lenders",
    level: 1,
    type: "qa",
    q: "Would a lender rather finance a branded hotel or an independent one, and why?",
    a: "Usually branded. The flag brings reservation and loyalty demand that survives the borrower's failure, protected by a comfort letter; brand standards keep the hotel maintained; and performance is easy to benchmark. Lenders do finance strong independents, such as resorts or well-located boutique hotels with long track records, but usually at lower leverage and with more weight on the operator.",
    why: "A lender cares about what the hotel earns if the borrower disappears. A branded hotel's demand comes partly from the brand's distribution, which stays with the hotel through a foreclosure if the comfort letter works. An independent's demand rests on its own marketing, reputation and operator, which are harder to underwrite and easier to lose in a change of ownership. A brand doesn't fix a bad location, though, and a unique independent can outperform branded neighbors. Lenders price the extra uncertainty with lower leverage, a higher debt yield or a stronger operator rather than refusing outright.",
    trap: "The follow-up: what about a soft brand? It sits in between: the hotel keeps its identity but taps a brand's reservation system and loyalty program, and lenders usually give credit for that distribution, especially with a comfort letter in place."
  }
]);
