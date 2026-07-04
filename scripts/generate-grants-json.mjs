/**
 * Generator for data/grants.json — run with: node scripts/generate-grants-json.mjs
 * Then seed Supabase with: node scripts/seed-grants.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/grants.json");

const CATEGORIES = [
  "Education",
  "Youth Programs",
  "Sports & Recreation",
  "STEM & Technology",
  "Community Development",
  "Arts & Culture",
  "Environment",
  "Healthcare",
  "Food Security",
  "Animal Welfare",
  "Capacity Building",
];

const REGIONS = {
  national: "National",
  texas: "Texas",
  regional: [
    "South Central US",
    "Southwest US",
    "Southeast US",
    "Midwest US",
    "Northeast US",
    "Western US",
  ],
};

const TARGET_GRANT_COUNT = 200;

/** @type {Array<{title:string,funder:string,category:string,description:string,amount:number,regionKey:"national"|"texas"|"regional",regionalIndex?:number}>} */
const GRANT_TEMPLATES = [
  // Education (9)
  { title: "Lumina Foundation Community College Success Fund", funder: "Lumina Foundation", category: "Education", description: "Supports community-based organizations partnering with community colleges to improve completion rates for first-generation and low-income students.", amount: 175000, regionKey: "national" },
  { title: "Scholarship America Emergency Aid Expansion", funder: "Scholarship America", category: "Education", description: "Funds nonprofits that administer emergency financial aid programs helping students remain enrolled during unexpected hardship.", amount: 85000, regionKey: "national" },
  { title: "Houston Endowment Early Literacy Initiative", funder: "Houston Endowment", category: "Education", description: "Invests in out-of-school literacy programs serving Houston-area elementary students reading below grade level.", amount: 120000, regionKey: "texas" },
  { title: "Educate Texas Rural College Access Network", funder: "Educate Texas", category: "Education", description: "Expands college advising, FAFSA completion support, and campus visit programs in rural Texas high schools.", amount: 95000, regionKey: "texas" },
  { title: "Dallas Foundation K-12 Equity Grants", funder: "The Dallas Foundation", category: "Education", description: "Provides operating support to nonprofits closing opportunity gaps in Dallas ISD and surrounding districts.", amount: 65000, regionKey: "texas" },
  { title: "New Teacher Project Instructional Coaching Fund", funder: "The New Teacher Project", category: "Education", description: "Supports high-impact tutoring and instructional coaching models in under-resourced public schools.", amount: 140000, regionKey: "national" },
  { title: "Chicago Community Trust Adult Education Bridge", funder: "Chicago Community Trust", category: "Education", description: "Funds bridge programs connecting adult learners to GED completion, ESL, and workforce credentials.", amount: 75000, regionKey: "regional", regionalIndex: 3 },
  { title: "Silicon Valley Community Foundation STEM Pathways", funder: "Silicon Valley Community Foundation", category: "Education", description: "Backs after-school STEM enrichment and mentorship for middle school students in Title I schools.", amount: 110000, regionKey: "regional", regionalIndex: 5 },
  { title: "Boston Foundation Summer Learning Acceleration", funder: "The Boston Foundation", category: "Education", description: "Expands evidence-based summer learning programs reducing seasonal learning loss in urban districts.", amount: 90000, regionKey: "regional", regionalIndex: 4 },

  // Youth Programs (9)
  { title: "Mott Foundation Positive Youth Development Fund", funder: "Charles Stewart Mott Foundation", category: "Youth Programs", description: "Supports community organizations delivering mentoring, leadership development, and safe after-school environments for teens.", amount: 125000, regionKey: "national" },
  { title: "Texas Youth Commission Prevention Partnership", funder: "OneStar Foundation", category: "Youth Programs", description: "Funds diversion and prevention programs reducing juvenile justice involvement among at-risk Texas youth.", amount: 80000, regionKey: "texas" },
  { title: "Austin Community Foundation Youth Leadership Corps", funder: "Austin Community Foundation", category: "Youth Programs", description: "Develops paid youth leadership cohorts addressing local civic challenges through service projects.", amount: 55000, regionKey: "texas" },
  { title: "San Antonio Area Foundation Teen Opportunity Fund", funder: "San Antonio Area Foundation", category: "Youth Programs", description: "Invests in workforce exposure, internships, and life skills training for opportunity youth ages 16–24.", amount: 70000, regionKey: "texas" },
  { title: "Annie E. Casey Foundation Family Stability Grants", funder: "Annie E. Casey Foundation", category: "Youth Programs", description: "Supports two-generation approaches connecting parents and children to economic mobility resources.", amount: 200000, regionKey: "national" },
  { title: "United Way Metro Atlanta Youth Success", funder: "United Way of Greater Atlanta", category: "Youth Programs", description: "Funds collective impact coalitions improving youth employment and graduation outcomes in metro Atlanta.", amount: 85000, regionKey: "regional", regionalIndex: 2 },
  { title: "Denver Foundation Immigrant Youth Integration", funder: "The Denver Foundation", category: "Youth Programs", description: "Provides bilingual case management and academic support for newly arrived immigrant and refugee youth.", amount: 60000, regionKey: "regional", regionalIndex: 5 },
  { title: "Baltimore Community Foundation YouthWorks Expansion", funder: "Associated Black Charities", category: "Youth Programs", description: "Expands subsidized summer employment placements connecting Baltimore teens to local employers.", amount: 72000, regionKey: "regional", regionalIndex: 4 },
  { title: "Kansas City Community Foundation Youth Mental Health", funder: "Greater Kansas City Community Foundation", category: "Youth Programs", description: "Supports school-linked mental health services and peer support groups for adolescents.", amount: 68000, regionKey: "regional", regionalIndex: 3 },

  // Sports & Recreation (8)
  { title: "LA84 Foundation Youth Sports Access Fund", funder: "LA84 Foundation", category: "Sports & Recreation", description: "Eliminates participation fees and equipment barriers for youth sports programs in underserved communities.", amount: 50000, regionKey: "regional", regionalIndex: 5 },
  { title: "Dick's Sporting Goods Sports Matter Community Grants", funder: "Dick's Sporting Goods Foundation", category: "Sports & Recreation", description: "Revives underfunded youth sports leagues and school athletic programs facing budget cuts.", amount: 25000, regionKey: "national" },
  { title: "Texas Parks and Wildlife Community Outdoor Outreach", funder: "Texas Parks and Wildlife Foundation", category: "Sports & Recreation", description: "Introduces underserved Texas youth to outdoor recreation, conservation, and nature-based programming.", amount: 45000, regionKey: "texas" },
  { title: "Houston Livestock Show and Rodeo Educational Grants", funder: "Houston Livestock Show and Rodeo", category: "Sports & Recreation", description: "Supports youth agriculture, rodeo education, and leadership programs across Greater Houston.", amount: 100000, regionKey: "texas" },
  { title: "Good Sports Equipment Access Program", funder: "Good Sports", category: "Sports & Recreation", description: "Provides new sports equipment and apparel to youth organizations serving low-income communities nationally.", amount: 15000, regionKey: "national" },
  { title: "Cal Ripken Sr. Foundation Youth Development Parks", funder: "Cal Ripken Sr. Foundation", category: "Sports & Recreation", description: "Builds multipurpose youth development parks combining sports, STEM, and mentorship in at-risk neighborhoods.", amount: 250000, regionKey: "national" },
  { title: "Fort Worth Sports Foundation Adaptive Athletics", funder: "Fort Worth Sports Foundation", category: "Sports & Recreation", description: "Funds adaptive sports programs for youth with disabilities in Tarrant County.", amount: 35000, regionKey: "texas" },
  { title: "Minnesota Twins Community Fund Play Ball Initiative", funder: "Minnesota Twins Community Fund", category: "Sports & Recreation", description: "Expands baseball and softball programming in Twin Cities neighborhoods with limited recreational access.", amount: 40000, regionKey: "regional", regionalIndex: 3 },

  // STEM & Technology (9)
  { title: "Girls Who Code Community Impact Fund", funder: "Girls Who Code", category: "STEM & Technology", description: "Launches free coding clubs and summer immersion programs for girls and non-binary youth in underserved areas.", amount: 80000, regionKey: "national" },
  { title: "Code.org Regional Partner Expansion Grant", funder: "Code.org", category: "STEM & Technology", description: "Trains teachers and provides curriculum resources to expand computer science access in public schools.", amount: 65000, regionKey: "national" },
  { title: "Texas Instruments Foundation STEM Teacher Pipeline", funder: "Texas Instruments Foundation", category: "STEM & Technology", description: "Invests in STEM teacher recruitment, retention, and professional development in North Texas districts.", amount: 150000, regionKey: "texas" },
  { title: "Rice University Tapia Center Outreach Partnership", funder: "Rice University Tapia Center", category: "STEM & Technology", description: "Supports STEM camps and teacher workshops serving Houston-area students underrepresented in STEM fields.", amount: 55000, regionKey: "texas" },
  { title: "National Science Foundation Broader Impacts Community Fund", funder: "National Science Foundation", category: "STEM & Technology", description: "Funds community nonprofits translating scientific research into public education and citizen science projects.", amount: 180000, regionKey: "national" },
  { title: "Microsoft TechSpark Digital Skills Initiative", funder: "Microsoft Philanthropies", category: "STEM & Technology", description: "Expands digital literacy, cloud fundamentals, and AI readiness training for rural community nonprofits.", amount: 95000, regionKey: "national" },
  { title: "Phoenix Bioscience Core STEM Pathways", funder: "Flinn Foundation", category: "STEM & Technology", description: "Connects Arizona high school students to bioscience internships and lab-based learning experiences.", amount: 70000, regionKey: "regional", regionalIndex: 1 },
  { title: "Research Triangle Foundation Biotech Youth Academy", funder: "Research Triangle Foundation", category: "STEM & Technology", description: "Funds biotech career exploration programs for first-generation college-bound students in North Carolina.", amount: 85000, regionKey: "regional", regionalIndex: 2 },
  { title: "Detroit Regional Chamber Mobility Tech Education", funder: "Detroit Regional Chamber Foundation", category: "STEM & Technology", description: "Supports EV, mobility, and advanced manufacturing training programs for Detroit-area youth.", amount: 90000, regionKey: "regional", regionalIndex: 3 },

  // Community Development (9)
  { title: "Local Initiatives Support Corporation Neighborhood Grants", funder: "LISC", category: "Community Development", description: "Supports resident-led neighborhood revitalization, commercial corridor development, and community ownership models.", amount: 150000, regionKey: "national" },
  { title: "Neighborhood Funders Group Equitable Development", funder: "Neighborhood Funders Group", category: "Community Development", description: "Funds anti-displacement organizing, community land trusts, and equitable transit-oriented development.", amount: 125000, regionKey: "national" },
  { title: "Communities Foundation of Texas Thrive North Texas", funder: "Communities Foundation of Texas", category: "Community Development", description: "Invests in collaborative place-based initiatives improving economic mobility in Dallas-Fort Worth neighborhoods.", amount: 110000, regionKey: "texas" },
  { title: "El Paso Community Foundation Borderplex Prosperity", funder: "El Paso Community Foundation", category: "Community Development", description: "Supports cross-border community development, workforce housing, and small business incubation in the Borderplex region.", amount: 75000, regionKey: "texas" },
  { title: "Rural LISC Texas Main Street Revitalization", funder: "Rural LISC", category: "Community Development", description: "Revitalizes downtown commercial districts and supports entrepreneurship in rural Texas communities.", amount: 60000, regionKey: "texas" },
  { title: "Enterprise Community Partners Rural Housing Fund", funder: "Enterprise Community Partners", category: "Community Development", description: "Finances technical assistance for affordable housing development and tenant services in rural counties.", amount: 200000, regionKey: "national" },
  { title: "New Orleans Community Support Foundation Recovery", funder: "Greater New Orleans Foundation", category: "Community Development", description: "Strengthens community-based organizations leading equitable recovery and resilience planning.", amount: 80000, regionKey: "regional", regionalIndex: 0 },
  { title: "Philadelphia Foundation Neighborhood Equity Fund", funder: "Philadelphia Foundation", category: "Community Development", description: "Supports community benefit agreements, civic engagement, and local hiring in redevelopment projects.", amount: 95000, regionKey: "regional", regionalIndex: 4 },
  { title: "Seattle Foundation Equitable Development Initiative", funder: "Seattle Foundation", category: "Community Development", description: "Funds BIPOC-led community development corporations preserving cultural anchors in gentrifying neighborhoods.", amount: 130000, regionKey: "regional", regionalIndex: 5 },

  // Arts & Culture (8)
  { title: "National Endowment for the Arts Challenge America", funder: "National Endowment for the Arts", category: "Arts & Culture", description: "Extends arts access to underserved populations through performances, exhibitions, and arts education.", amount: 10000, regionKey: "national" },
  { title: "Mid-America Arts Alliance Touring Fund", funder: "Mid-America Arts Alliance", category: "Arts & Culture", description: "Supports touring exhibitions, artist residencies, and cultural programs reaching rural and suburban audiences.", amount: 35000, regionKey: "regional", regionalIndex: 0 },
  { title: "Texas Commission on the Arts Cultural District Grants", funder: "Texas Commission on the Arts", category: "Arts & Culture", description: "Funds programming and marketing for certified cultural districts across Texas cities and towns.", amount: 50000, regionKey: "texas" },
  { title: "Austin Creative Alliance Community Arts Fund", funder: "Austin Creative Alliance", category: "Arts & Culture", description: "Provides general operating support to small and mid-size arts nonprofits serving Austin communities.", amount: 25000, regionKey: "texas" },
  { title: "Ford Foundation Arts and Culture for Social Justice", funder: "Ford Foundation", category: "Arts & Culture", description: "Invests in artists and cultural organizations advancing narrative change and civic participation.", amount: 250000, regionKey: "national" },
  { title: "Knight Foundation Community Journalism and Arts", funder: "Knight Foundation", category: "Arts & Culture", description: "Supports local storytelling, public art, and creative placemaking in Knight Foundation communities.", amount: 75000, regionKey: "national" },
  { title: "Memphis Music Initiative Youth Artist Development", funder: "Memphis Music Initiative", category: "Arts & Culture", description: "Develops youth musicians and teaching artists through ensemble programs and paid performance opportunities.", amount: 45000, regionKey: "regional", regionalIndex: 0 },
  { title: "Santa Fe Community Foundation Native Arts Preservation", funder: "Santa Fe Community Foundation", category: "Arts & Culture", description: "Preserves Indigenous and Latino cultural traditions through intergenerational arts apprenticeship programs.", amount: 55000, regionKey: "regional", regionalIndex: 1 },

  // Environment (9)
  { title: "Environmental Defense Fund Climate Resilience Community Fund", funder: "Environmental Defense Fund", category: "Environment", description: "Supports community-led climate adaptation planning, urban heat mitigation, and flood preparedness.", amount: 100000, regionKey: "national" },
  { title: "Trust for Public Land Urban Green Space Access", funder: "Trust for Public Land", category: "Environment", description: "Creates and renovates parks and green schoolyards in neighborhoods lacking safe outdoor space.", amount: 175000, regionKey: "national" },
  { title: "Texas Conservation Fund Land Stewardship Grants", funder: "Texas Conservation Fund", category: "Environment", description: "Protects working lands, riparian corridors, and wildlife habitat through conservation easements and stewardship.", amount: 125000, regionKey: "texas" },
  { title: "Houston Advanced Research Center Gulf Coast Resilience", funder: "Houston Advanced Research Center", category: "Environment", description: "Funds community science and coastal restoration projects addressing Gulf Coast environmental threats.", amount: 90000, regionKey: "texas" },
  { title: "Cynthia and George Mitchell Foundation Water Sustainability", funder: "Cynthia and George Mitchell Foundation", category: "Environment", description: "Invests in water conservation education, green infrastructure, and watershed protection in Texas.", amount: 85000, regionKey: "texas" },
  { title: "Surfrider Foundation Clean Water Community Grants", funder: "Surfrider Foundation", category: "Environment", description: "Supports water quality monitoring, plastic reduction, and beach cleanup programs led by local chapters.", amount: 15000, regionKey: "national" },
  { title: "Appalachian Voices Just Transition Community Fund", funder: "Appalachian Voices", category: "Environment", description: "Funds economic diversification and environmental remediation in coal-impacted Appalachian communities.", amount: 70000, regionKey: "regional", regionalIndex: 2 },
  { title: "Great Lakes Protection Fund Community Stewardship", funder: "Great Lakes Protection Fund", category: "Environment", description: "Supports shoreline restoration, invasive species control, and community water stewardship in Great Lakes states.", amount: 95000, regionKey: "regional", regionalIndex: 3 },
  { title: "Oregon Community Foundation Wildfire Recovery", funder: "Oregon Community Foundation", category: "Environment", description: "Rebuilds community green infrastructure and supports reforestation after catastrophic wildfire seasons.", amount: 80000, regionKey: "regional", regionalIndex: 5 },

  // Healthcare (8)
  { title: "Robert Wood Johnson Foundation Health Equity Fund", funder: "Robert Wood Johnson Foundation", category: "Healthcare", description: "Advances community-rooted solutions addressing social determinants of health and care access disparities.", amount: 300000, regionKey: "national" },
  { title: "Direct Relief Community Health Clinic Support", funder: "Direct Relief", category: "Healthcare", description: "Provides medical supplies, equipment, and capacity support to Federally Qualified Health Centers.", amount: 50000, regionKey: "national" },
  { title: "St. David's Foundation Central Texas Health Access", funder: "St. David's Foundation", category: "Healthcare", description: "Expands preventive care, behavioral health integration, and mobile clinic services in Central Texas.", amount: 140000, regionKey: "texas" },
  { title: "Methodist Healthcare Ministries of South Texas", funder: "Methodist Healthcare Ministries", category: "Healthcare", description: "Funds parish nurse programs, dental access, and maternal health services in South Texas counties.", amount: 100000, regionKey: "texas" },
  { title: "Texas Health Resources Community Impact Fund", funder: "Texas Health Resources Foundation", category: "Healthcare", description: "Supports community health worker programs addressing chronic disease in North Texas underserved areas.", amount: 75000, regionKey: "texas" },
  { title: "Delta Health Center Rural Primary Care Expansion", funder: "National Association of Community Health Centers", category: "Healthcare", description: "Expands sliding-scale primary care access in rural communities with provider shortages.", amount: 120000, regionKey: "national" },
  { title: "Nashville Health Care Council Community Wellness", funder: "Metro Nashville Public Health Foundation", category: "Healthcare", description: "Funds hypertension and diabetes prevention programs in Nashville neighborhoods with high chronic disease rates.", amount: 55000, regionKey: "regional", regionalIndex: 0 },
  { title: "Cleveland Clinic Community Health Outreach", funder: "Cleveland Clinic Foundation", category: "Healthcare", description: "Supports school-based health centers and maternal-infant health navigation in Greater Cleveland.", amount: 85000, regionKey: "regional", regionalIndex: 3 },

  // Food Security (8)
  { title: "Feeding America Network Capacity Building Fund", funder: "Feeding America", category: "Food Security", description: "Strengthens food bank refrigeration, transportation, and partner agency distribution networks.", amount: 150000, regionKey: "national" },
  { title: "No Kid Hungry School Breakfast Expansion", funder: "Share Our Strength", category: "Food Security", description: "Increases school breakfast participation through grab-and-go models and community eligibility provision.", amount: 45000, regionKey: "national" },
  { title: "Central Texas Food Bank Community Garden Network", funder: "Central Texas Food Bank", category: "Food Security", description: "Establishes community gardens and nutrition education programs in food desert neighborhoods.", amount: 35000, regionKey: "texas" },
  { title: "North Texas Food Bank Mobile Pantry Expansion", funder: "North Texas Food Bank", category: "Food Security", description: "Deploys mobile pantry routes serving seniors, rural residents, and working families facing food insecurity.", amount: 60000, regionKey: "texas" },
  { title: "Houston Food Bank Disaster Ready Nutrition", funder: "Houston Food Bank", category: "Food Security", description: "Builds disaster-ready food distribution capacity and culturally responsive emergency meal programs.", amount: 80000, regionKey: "texas" },
  { title: "Wholesome Wave Produce Prescription Program", funder: "Wholesome Wave", category: "Food Security", description: "Funds produce prescription programs connecting healthcare providers and farmers markets for low-income families.", amount: 50000, regionKey: "national" },
  { title: "Food Bank of the Rockies Rural Hunger Relief", funder: "Food Bank of the Rockies", category: "Food Security", description: "Expands rural hunger relief through mobile markets and SNAP enrollment assistance in mountain communities.", amount: 42000, regionKey: "regional", regionalIndex: 5 },
  { title: "Alabama Food Bank Association Senior Nutrition", funder: "Community Food Bank of Central Alabama", category: "Food Security", description: "Delivers medically tailored meals and senior commodity boxes in underserved Alabama counties.", amount: 38000, regionKey: "regional", regionalIndex: 2 },

  // Animal Welfare (7)
  { title: "ASPCA Community Veterinary Services Fund", funder: "ASPCA", category: "Animal Welfare", description: "Expands low-cost spay/neuter, vaccination, and wellness clinics in underserved communities.", amount: 75000, regionKey: "national" },
  { title: "Best Friends Animal Society Community Cat Program", funder: "Best Friends Animal Society", category: "Animal Welfare", description: "Supports trap-neuter-return programs and shelter diversion for community cat populations.", amount: 25000, regionKey: "national" },
  { title: "Texas Humane Heroes Rural Shelter Support", funder: "Texas Humane Heroes", category: "Animal Welfare", description: "Provides transport, medical care, and adoption support for rural Texas shelters with limited resources.", amount: 30000, regionKey: "texas" },
  { title: "SPCA of Texas Community Outreach Grants", funder: "SPCA of Texas", category: "Animal Welfare", description: "Funds pet retention services including emergency veterinary assistance and pet food pantries.", amount: 20000, regionKey: "texas" },
  { title: "Petco Love Adoption and Medical Fund", funder: "Petco Love", category: "Animal Welfare", description: "Supports adoption events, foster networks, and medical treatment for shelter animals nationally.", amount: 35000, regionKey: "national" },
  { title: "Austin Pets Alive! Neonatal Kitten Nursery", funder: "Austin Pets Alive!", category: "Animal Welfare", description: "Expands neonatal kitten nursery operations and volunteer foster recruitment in Central Texas.", amount: 45000, regionKey: "texas" },
  { title: "Wisconsin Humane Society Community Education", funder: "Wisconsin Humane Society", category: "Animal Welfare", description: "Delivers humane education, cruelty prevention, and youth volunteer programs in Milwaukee-area schools.", amount: 28000, regionKey: "regional", regionalIndex: 3 },

  // Capacity Building (8)
  { title: "Nonprofit Finance Fund Financial Management Fund", funder: "Nonprofit Finance Fund", category: "Capacity Building", description: "Provides financial consulting, cash flow analysis, and working capital for growing nonprofits.", amount: 100000, regionKey: "national" },
  { title: "BoardSource Nonprofit Governance Excellence", funder: "BoardSource", category: "Capacity Building", description: "Funds board training, succession planning, and governance assessments for small nonprofits.", amount: 15000, regionKey: "national" },
  { title: "OneStar Foundation Texas Nonprofit Strong", funder: "OneStar Foundation", category: "Capacity Building", description: "Strengthens Texas nonprofit infrastructure through leadership development and organizational assessments.", amount: 50000, regionKey: "texas" },
  { title: "United Way of Metropolitan Dallas Capacity Grants", funder: "United Way of Metropolitan Dallas", category: "Capacity Building", description: "Invests in data systems, evaluation capacity, and collaborative backbone support for partner agencies.", amount: 65000, regionKey: "texas" },
  { title: "T.L.L. Temple Foundation Rural Nonprofit Capacity", funder: "T.L.L. Temple Foundation", category: "Capacity Building", description: "Builds fundraising, grant writing, and financial management capacity for East Texas nonprofits.", amount: 40000, regionKey: "texas" },
  { title: "TechSoup Digital Transformation Fund", funder: "TechSoup", category: "Capacity Building", description: "Provides discounted technology, CRM implementation, and cybersecurity training for nonprofits.", amount: 20000, regionKey: "national" },
  { title: "Propel Nonprofits Financial Management Training", funder: "Propel Nonprofits", category: "Capacity Building", description: "Offers cohort-based financial leadership training and customized consulting for Midwest nonprofits.", amount: 35000, regionKey: "regional", regionalIndex: 3 },
  { title: "San Francisco Foundation Power Building Fund", funder: "San Francisco Foundation", category: "Capacity Building", description: "Supports BIPOC-led nonprofits with general operating grants and leadership development.", amount: 90000, regionKey: "regional", regionalIndex: 5 },

  // Additional grants to reach 100 (8)
  { title: "Kresge Foundation Education Pathways Initiative", funder: "The Kresge Foundation", category: "Education", description: "Supports postsecondary access pipelines connecting K-12 partners to two- and four-year institutions.", amount: 160000, regionKey: "national" },
  { title: "Fort Worth Youth Collaborative Opportunity Fund", funder: "Fort Worth Youth Collaborative", category: "Youth Programs", description: "Coordinates cross-agency referrals and wraparound services for disconnected Tarrant County youth.", amount: 62000, regionKey: "texas" },
  { title: "Special Olympics Texas Unified Sports Expansion", funder: "Special Olympics Texas", category: "Sports & Recreation", description: "Expands inclusive unified sports programs pairing students with and without intellectual disabilities.", amount: 38000, regionKey: "texas" },
  { title: "Infy Foundation USA Digital Inclusion Grants", funder: "Infosys Foundation USA", category: "STEM & Technology", description: "Funds maker spaces, robotics clubs, and computer science teacher training in underserved schools.", amount: 72000, regionKey: "national" },
  { title: "Local Initiatives Support Corporation Rio Grande Valley Fund", funder: "LISC Rio Grande Valley", category: "Community Development", description: "Invests in colonia infrastructure, small business support, and workforce housing in the Rio Grande Valley.", amount: 88000, regionKey: "texas" },
  { title: "South Arts Folk and Traditional Arts Fund", funder: "South Arts", category: "Arts & Culture", description: "Preserves folk and traditional arts through master-apprentice programs across the South Central region.", amount: 18000, regionKey: "regional", regionalIndex: 0 },
  { title: "National Fish and Wildlife Foundation Urban Waters Grant", funder: "National Fish and Wildlife Foundation", category: "Environment", description: "Restores urban waterways, installs green stormwater infrastructure, and engages residents in watershed stewardship.", amount: 65000, regionKey: "national" },
  { title: "Partnership for a Healthy Mississippi Delta Nutrition", funder: "Partnership for a Healthy Mississippi", category: "Food Security", description: "Addresses childhood hunger through school pantry programs and SNAP outreach in Delta communities.", amount: 48000, regionKey: "regional", regionalIndex: 0 },
];

const EXPANSION_FUNDERS = [
  "Community Foundation Alliance",
  "Regional Impact Partners",
  "Horizon Giving Fund",
  "NeighborGood Foundation",
  "Bright Future Fund",
  "Open Door Philanthropies",
  "Heartland Community Trust",
  "Summit Social Impact Fund",
  "Bridge Builders Foundation",
  "North Star Giving Collaborative",
  "Common Good Initiative",
  "Legacy Impact Partners",
  "Pathways Forward Fund",
  "Thrive Together Foundation",
  "Catalyst Community Fund",
];

const EXPANSION_FOCUS = {
  Education: [
    "after-school tutoring",
    "college readiness",
    "adult literacy",
    "teacher development",
    "early childhood education",
  ],
  "Youth Programs": [
    "mentoring",
    "workforce readiness",
    "leadership development",
    "diversion programs",
    "summer enrichment",
  ],
  "Sports & Recreation": [
    "youth athletics",
    "adaptive recreation",
    "park programming",
    "equipment access",
    "outdoor education",
  ],
  "STEM & Technology": [
    "coding clubs",
    "robotics labs",
    "digital literacy",
    "maker spaces",
    "STEM teacher training",
  ],
  "Community Development": [
    "neighborhood revitalization",
    "small business support",
    "affordable housing",
    "civic engagement",
    "workforce housing",
  ],
  "Arts & Culture": [
    "community arts",
    "public art",
    "cultural preservation",
    "youth arts",
    "creative placemaking",
  ],
  Environment: [
    "urban greening",
    "conservation",
    "climate resilience",
    "water stewardship",
    "recycling education",
  ],
  Healthcare: [
    "community clinics",
    "behavioral health",
    "maternal health",
    "preventive care",
    "health navigation",
  ],
  "Food Security": [
    "food pantries",
    "nutrition education",
    "school meals",
    "urban gardens",
    "senior nutrition",
  ],
  "Animal Welfare": [
    "spay and neuter",
    "shelter support",
    "humane education",
    "community vet care",
    "foster networks",
  ],
  "Capacity Building": [
    "nonprofit training",
    "fundraising capacity",
    "board development",
    "technology upgrades",
    "strategic planning",
  ],
};

function generateExpansionTemplates(count, startIndex) {
  const templates = [];
  const regionKeys = ["national", "texas", "regional"];

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const category = CATEGORIES[index % CATEGORIES.length];
    const regionKey = regionKeys[index % regionKeys.length];
    const focusOptions = EXPANSION_FOCUS[category];
    const focus = focusOptions[index % focusOptions.length];
    const funder = EXPANSION_FUNDERS[index % EXPANSION_FUNDERS.length];
    const amount = 18000 + ((index * 7919) % 220000);

    templates.push({
      title: `${category} ${focus.replace(/\b\w/g, (c) => c.toUpperCase())} Partnership Grant`,
      funder: `${funder} — ${category} Program`,
      category,
      description: `Supports nonprofits expanding ${focus} services for underserved communities through program funding, staff capacity, and community partnerships.`,
      amount,
      regionKey,
      regionalIndex: index % REGIONS.regional.length,
    });
  }

  return templates;
}

const EXPANSION_TEMPLATES = generateExpansionTemplates(
  TARGET_GRANT_COUNT - GRANT_TEMPLATES.length,
  GRANT_TEMPLATES.length,
);

const ALL_TEMPLATES = [...GRANT_TEMPLATES, ...EXPANSION_TEMPLATES];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function buildApplicationUrl(funder, grantId) {
  const funderSlug = slugify(funder).slice(0, 48);
  return `https://${funderSlug}.org/grants/apply/${grantId}`;
}

function resolveRegion(template) {
  if (template.regionKey === "national") return REGIONS.national;
  if (template.regionKey === "texas") return REGIONS.texas;
  return REGIONS.regional[template.regionalIndex ?? 0];
}

function addDays(base, days) {
  const date = new Date(base);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const BASE = "2026-01-15T00:00:00.000Z";

if (GRANT_TEMPLATES.length !== 100) {
  throw new Error(`Expected 100 base templates, got ${GRANT_TEMPLATES.length}`);
}

if (ALL_TEMPLATES.length !== TARGET_GRANT_COUNT) {
  throw new Error(`Expected ${TARGET_GRANT_COUNT} templates, got ${ALL_TEMPLATES.length}`);
}

const usedIds = new Set();

function uniqueGrantId(title) {
  let id = slugify(title);
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${slugify(title).slice(0, 64)}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

const grants = ALL_TEMPLATES.map((template, index) => {
  const id = uniqueGrantId(template.title);
  const region = resolveRegion(template);
  const deadline = addDays("2026-06-28", 14 + (index % 180));
  const createdAt = addDays("2025-01-01", index * 3);

  return {
    id,
    title: template.title,
    description: template.description,
    funder: template.funder,
    category: template.category,
    region,
    status: "open",
    amount: template.amount,
    deadline,
    applicationUrl: buildApplicationUrl(template.funder, id),
    createdAt: `${createdAt}T00:00:00.000Z`,
    updatedAt: BASE,
  };
});

const categoryCounts = {};
const regionCounts = {};
for (const grant of grants) {
  categoryCounts[grant.category] = (categoryCounts[grant.category] || 0) + 1;
  regionCounts[grant.region] = (regionCounts[grant.region] || 0) + 1;
}

const ids = new Set(grants.map((g) => g.id));
if (ids.size !== TARGET_GRANT_COUNT) {
  throw new Error("Duplicate grant IDs detected");
}

writeFileSync(OUT, `${JSON.stringify(grants, null, 2)}\n`);

console.log(`Wrote ${grants.length} grants to ${OUT}`);
console.log("Categories:", categoryCounts);
console.log("Regions:", regionCounts);
