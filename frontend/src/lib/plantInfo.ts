/** Short hints for UI; not medical advice. */
const PLANT_BLURBS: Record<string, string> = {
  Apple:
    "Apple leaf issues often include scab (fungal), rust, or black rot. Good sanitation and resistant cultivars help.",
  Blueberry: "Blueberry leaves are checked for mummy berry, rust, and nutrient stress.",
  Cherry: "Cherry foliage may show powdery mildew or bacterial issues depending on season.",
  Corn: "Corn leaves reflect rust, blight, or insect damage patterns.",
  Grape: "Grape leaves show downy mildew, black rot, or esca-like patterns in datasets.",
  Orange: "Citrus leaves may show greening-related patterns or fungal spots in research imagery.",
  Peach: "Peach leaf curl and bacterial spot are common classes in agricultural datasets.",
  Pepper:
    "Bell pepper leaves: watch for bacterial spot, mosaic viruses, and healthy vs infected contrast.",
  Potato: "Potato early/late blight and healthy leaves are classic classification targets.",
  Raspberry: "Raspberry leaf health vs disease is often a simpler binary in field imagery.",
  Soybean: "Soybean datasets include bacterial blight, rust, and frog-eye leaf spot.",
  Squash: "Squash powdery mildew is a frequent leaf-level disease in CV benchmarks.",
  Strawberry: "Strawberry leaf scorch, angular leaf spot, and healthy classes appear in plant datasets.",
  Tomato:
    "Tomato has many disease classes (bacterial spot, early blight, mosaic, etc.) — confirm with an agronomist in the field.",
};

export function splitClassName(full: string): { plant: string; condition: string } {
  const parts = full.split("___");
  if (parts.length >= 2)
    return { plant: parts[0].replace(/_/g, " "), condition: parts.slice(1).join(" ").replace(/_/g, " ") };
  return { plant: full, condition: "" };
}

export function hintForPlant(plantKey: string): string {
  return (
    PLANT_BLURBS[plantKey] ??
    "This class comes from the plant disease benchmark dataset. Use predictions as a screening aid, not a sole diagnosis."
  );
}

/** Shown near treatment suggestions — not legal or agronomic advice. */
export const PESTICIDE_DISCLAIMER =
  "Educational suggestions only—not a prescription, label, or rate. Check registrations for your crop and country, read the product label, wear PPE, and confirm with a qualified agronomist or extension service before applying anything.";

type GuideEntry = {
  description: string;
  /** Active ingredients, product classes, or IPM steps; user must verify labels locally */
  pesticides: string[];
};

/** Keys must match training folder names exactly (38 classes). */
const DISEASE_GUIDE: Record<string, GuideEntry> = {
  Apple___Apple_scab: {
    description:
      "Apple scab is caused by the fungus Venturia inaequalis. Olive to dark velvety spots on leaves and fruit are typical; severe infections can defoliate trees and reduce fruit quality.",
    pesticides: [
      "Preventive fungicides: captan, mancozeb, sulfur (organic option where labeled).",
      "Curative/systemic options where allowed: myclobutanil, tebuconazole, or difenoconazole—use per label timing (often pink bud to petal fall).",
      "Sanitation: rake fallen leaves; consider scab-resistant cultivars for home orchards.",
    ],
  },
  Apple___Black_rot: {
    description:
      "Black rot (Botryosphaeria / Physalospora group) causes frog-eye leaf spots and fruit rot. Warm, wet weather favors spread; cankers on branches are part of the disease cycle.",
    pesticides: [
      "Protectant fungicides during spring: captan, ziram, or mancozeb where registered.",
      "Prune dead wood and cankers during dry weather; dispose of infected fruit and mummies.",
      "For serious outbreaks, extension may recommend additional fungicides—match product to your region’s label.",
    ],
  },
  Apple___Cedar_apple_rust: {
    description:
      "Cedar-apple rust needs both apple/crabapple and juniper (cedar) hosts. Bright orange-yellow spots on apple leaves are common in spring; spores spread from nearby junipers.",
    pesticides: [
      "Fungicides around pink bud/petal fall: myclobutanil, propiconazole, or triadimefon where labeled.",
      "Remove nearby alternate host junipers if feasible, or use resistant apple varieties.",
      "Repeat sprays per label if wet weather persists during primary infection periods.",
    ],
  },
  Apple___healthy: {
    description:
      "The model classifies this leaf as healthy-looking. That is not a guarantee—early disease, nutrient issues, or poor photos can still be misread.",
    pesticides: [
      "No pesticide needed solely because of a “healthy” prediction—use routine IPM: scouting, pruning for airflow, and balanced fertility.",
    ],
  },
  Blueberry___healthy: {
    description:
      "No obvious disease pattern matched the sick classes in this dataset. Continue monitoring for mummy berry, anthracnose, and leaf spots during the season.",
    pesticides: [
      "Focus on prevention: mulch, prune for air movement, soil pH in the 4.5–5.5 range for blueberries.",
      "Apply fungicides only when scouting or history indicates risk—see local blueberry spray guides.",
    ],
  },
  "Cherry_(including_sour)___healthy": {
    description:
      "Leaf appearance is consistent with the dataset’s healthy cherry class. Verify in the orchard, especially if weather has been humid.",
    pesticides: [
      "No spray solely from a healthy label; track powdery mildew and brown rot risk windows in your region.",
    ],
  },
  "Cherry_(including_sour)___Powdery_mildew": {
    description:
      "Powdery mildew on cherry shows white fungal growth on leaves and may distort new shoots. It favors mild temperatures and humid canopies.",
    pesticides: [
      "Sulfur, myclobutanil, or triforine where registered for cherry; some regions use potassium bicarbonate in organic systems.",
      "Improve airflow (pruning); avoid excessive nitrogen that pushes lush growth.",
    ],
  },
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    description:
      "Gray leaf spot (Cercospora zeae-maydis) causes rectangular tan lesions with sharp edges. It builds on residue in continuous corn and warm, humid weather.",
    pesticides: [
      "Triazole + strobilurin premixes (e.g., azoxystrobin + propiconazole) are common where labeled for corn foliar disease.",
      "Rotate crops, till residue where appropriate, and choose tolerant hybrids.",
    ],
  },
  "Corn_(maize)___Common_rust_": {
    description:
      "Common rust (Puccinia sorghi) produces cinnamon-brown pustules on leaves. Usually mid- to late-season; severity depends on hybrid resistance and weather.",
    pesticides: [
      "Foliar fungicides (strobilurins, triazoles, SDHIs) may pay when disease hits early and yield is at risk—follow local thresholds.",
      "Resistant hybrids are the first line of defense.",
    ],
  },
  "Corn_(maize)___healthy": {
    description:
      "The image fits the dataset’s healthy corn leaf class. Confirm there is no subtle nutrient burn or insect injury in the field.",
    pesticides: [
      "No treatment from this label alone; scout for rust, blight, and northern leaf blight as the season progresses.",
    ],
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    description:
      "Northern corn leaf blight (Exserohilum turcicum) shows long, cigar-shaped tan lesions. Heavy dew and moderate temperatures favor epidemics.",
    pesticides: [
      "Foliar fungicides (triazoles, strobilurins, SDHI mixes) when disease is early and hybrid is susceptible.",
      "Crop rotation, residue management, and resistant hybrids reduce inoculum.",
    ],
  },
  Grape___Black_rot: {
    description:
      "Black rot (Guignardia bidwellii) causes leaf spots and mummies fruit. Warm, wet springs drive fruit infections.",
    pesticides: [
      "Protectant + systemic programs: mancozeb, captan, or ziram mixed or rotated with myclobutanil or tebuconazole where labeled for grapes.",
      "Remove mummies and open canopy to speed drying.",
    ],
  },
  "Grape___Esca_(Black_Measles)": {
    description:
      "Esca is a trunk disease complex (fungi such as Phaeomoniella / Phaeoacremonium). Leaf symptoms may include interveinal chlorosis/necrosis (“tiger stripes”); wood decay is the core problem.",
    pesticides: [
      "No reliable “spray-only” cure—focus on vine surgery (double pruning), removing dead wood, and sanitizing tools between vines.",
      "Triazole injections are used in some regions under professional guidance; legality and efficacy vary—consult a viticulture advisor.",
      "Avoid wounding trunks; delay major cuts until dry weather.",
    ],
  },
  Grape___healthy: {
    description:
      "Classified as healthy in this dataset. Grape still needs routine scouting for downy mildew, powdery mildew, and black rot depending on your climate.",
    pesticides: [
      "No spray from this prediction alone; follow a regional grape IPM calendar when clusters form.",
    ],
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    description:
      "Isariopsis leaf spot (formerly ‘leaf blight’) shows irregular brown lesions on grape foliage. It is favored by wet seasons and dense canopies.",
    pesticides: [
      "Standard grape fungicide programs often use captan, mancozeb, or strobilurin/triazole rotations where labeled.",
      "Open canopy, leaf removal around clusters, and debris management reduce humidity-driven infections.",
    ],
  },
  "Orange___Haunglongbing_(Citrus_greening)": {
    description:
      "Huanglongbing (HLB), spread by Asian citrus psyllid, causes blotchy mottling and asymmetric chlorosis. There is no cure for infected trees; management is vector and nursery-tree focused.",
    pesticides: [
      "Vector control where permitted: systemic neonicotinoids (e.g., imidacloprid) or other psyllid-effective materials per local citrus IPM guides.",
      "Reflective mulches, biological controls, and coordinated area-wide psyllid management help slow spread.",
      "Follow regulatory guidance—removal of infected trees may be required in some areas.",
    ],
  },
  Peach___Bacterial_spot: {
    description:
      "Bacterial spot (Xanthomonas) causes angular leaf spots, shot holes, and fruit blemishes. Rain and wind-driven splash spread bacteria.",
    pesticides: [
      "Copper-based sprays (e.g., copper hydroxide) timed to bloom and shuck split where registered; antibiotic sprays (oxytetracycline) are restricted and region-specific.",
      "Avoid overhead irrigation; prune for airflow; choose tolerant cultivars where bacterial spot is chronic.",
    ],
  },
  Peach___healthy: {
    description:
      "Appears healthy relative to the dataset’s sick classes. Peach still needs attention for curl, brown rot, and oriental fruit moth depending on season.",
    pesticides: [
      "No treatment implied by this label; use dormant fungicides only per local peach schedules (e.g., curl management).",
    ],
  },
  "Pepper,_bell___Bacterial_spot": {
    description:
      "Bacterial spot on pepper shows small water-soaked lesions that may yellow and drop out. Warm, wet weather and overhead water worsen it.",
    pesticides: [
      "Copper + mancozeb mixes where labeled; some programs use acibenzolar-S-methyl (plant activator) as part of IPM.",
      "Use disease-free seed/transplants, avoid working wet foliage, and rotate away from solanaceous crops.",
    ],
  },
  "Pepper,_bell___healthy": {
    description:
      "Model suggests healthy bell pepper foliage. Confirm there is no early bacterial spot or aphid/virus pressure.",
    pesticides: [
      "No spray from this screen alone; scout and use labeled products only when thresholds are met.",
    ],
  },
  Potato___Early_blight: {
    description:
      "Early blight (Alternaria solani) causes target-like spots with concentric rings, often starting on older leaves. It can defoliate plants and reduce tuber size.",
    pesticides: [
      "Protectant fungicides: chlorothalonil, mancozeb, azoxystrobin, or premixes where registered for potato.",
      "Nutrition and irrigation: avoid stress; remove heavily infected lower leaves in garden settings if practical.",
    ],
  },
  Potato___healthy: {
    description:
      "Leaf matches the dataset’s healthy potato class. Tubers can still carry issues not visible on a single leaf image.",
    pesticides: [
      "No pesticide from this result; maintain hilling, consistent moisture, and certified seed.",
    ],
  },
  Potato___Late_blight: {
    description:
      "Late blight (Phytophthora infestans) causes dark, greasy lesions and white sporulation under humid conditions. It spreads rapidly and threatens tubers.",
    pesticides: [
      "Systemic + protectant programs where labeled: mandipropamid, fluopicolide, metalaxyl-M/mefenoxam, chlorothalonil, or cymoxanil mixes—rotate FRAC groups.",
      "Destroy infected cull piles; use resistant varieties when available; scout during cool, wet periods.",
    ],
  },
  Raspberry___healthy: {
    description:
      "Classified as healthy raspberry leaf in this benchmark. Watch for spur blight, cane diseases, and viruses over the season.",
    pesticides: [
      "No spray from this label; prune out old fruiting canes and improve airflow as part of routine care.",
    ],
  },
  Soybean___healthy: {
    description:
      "Appears healthy in the dataset sense. Soybean still faces rust, frogeye, and SDS in many regions—scouting matters.",
    pesticides: [
      "Foliar fungicides only when disease risk and growth stage justify cost—use extension thresholds.",
    ],
  },
  Squash___Powdery_mildew: {
    description:
      "Powdery mildew (Podosphaera xanthii) shows white talcum-like patches on leaves and can collapse vines late in the season.",
    pesticides: [
      "Sulfur, potassium bicarbonate, or horticultural oils in organic systems where labeled; conventional options include myclobutanil or triflumizole for cucurbits if registered.",
      "Choose resistant cultivars; avoid excess nitrogen; ensure spacing for sun and air movement.",
    ],
  },
  Strawberry___healthy: {
    description:
      "Healthy-looking strawberry foliage per the model. Fruit rots and angular leaf spot can still appear later.",
    pesticides: [
      "No treatment from this prediction; follow renovation and mulch practices typical for your growing system.",
    ],
  },
  Strawberry___Leaf_scorch: {
    description:
      "Leaf scorch (Diplocarpon earlianum) causes purple to brown spots on strawberry leaves and can reduce photosynthesis if severe.",
    pesticides: [
      "Captan, thiram, or azoxystrobin programs where labeled for strawberry foliar disease—timing varies by region.",
      "Remove old infected leaves after harvest (renovation); use clean planting stock.",
    ],
  },
  Tomato___Bacterial_spot: {
    description:
      "Bacterial spot (Xanthomonas) on tomato causes small dark lesions with yellow halos. Spread is splash-borne and worsened by handling wet plants.",
    pesticides: [
      "Copper-mancozeb programs where registered; some areas use acibenzolar-S-methyl as a supplement—not a silver bullet.",
      "Stake plants, avoid overhead irrigation, rotate crops, and use pathogen-free seed/transplants.",
    ],
  },
  Tomato___healthy: {
    description:
      "Tomato leaf appears healthy in model terms. Early blight and leaf spot often start later or on lower leaves.",
    pesticides: [
      "No fungicide solely from a healthy screen; begin protectant sprays only per local tomato disease forecasts.",
    ],
  },
  Tomato___Early_blight: {
    description:
      "Early blight (Alternaria solani) produces target spots and can yellow lower leaves. It is common when plants are stressed or humidity is high.",
    pesticides: [
      "Chlorothalonil, mancozeb, azoxystrobin, or premixes where labeled; rotate modes of action.",
      "Mulch soil to reduce splash; prune lowest leaves if airflow is poor (careful with wounds).",
    ],
  },
  Tomato___Late_blight: {
    description:
      "Late blight on tomato (same pathogen species complex as potato) causes brown, water-soaked patches and fuzzy sporulation under moist conditions.",
    pesticides: [
      "Use late-blight-specific programs where labeled: mandipropamid, fluopicolide, cymoxanil + chlorothalonil, or other effective mixes—follow regional alerts.",
      "Remove infected tissue when practical; improve ventilation in tunnels/greenhouses.",
    ],
  },
  Tomato___Leaf_Mold: {
    description:
      "Leaf mold (Passalora fulva) shows yellow patches on upper leaf surfaces and olive mold underneath. It is frequent in humid greenhouses or dense plantings.",
    pesticides: [
      "Improve airflow and reduce leaf wetness duration first.",
      "Fungicides where labeled: chlorothalonil, mancozeb, azoxystrobin, or specialty tomato greenhouse products per local guide.",
    ],
  },
  Tomato___Septoria_leaf_spot: {
    description:
      "Septoria lycopersici causes small circular spots with dark borders and tiny black fruiting bodies in the center. It starts low and works up the plant.",
    pesticides: [
      "Chlorothalonil, mancozeb, or azoxystrobin rotations where registered; begin before symptoms if history is bad.",
      "Mulch, stake, and avoid overhead irrigation; remove heavily infected leaves in small gardens.",
    ],
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    description:
      "Two-spotted spider mites are tiny arachnids that stipple leaves; fine webbing appears with heavy infestations. Hot, dry weather favors outbreaks.",
    pesticides: [
      "Miticides/acaricides where labeled: abamectin, bifenazate, spiromesifen, or etoxazole—rotate IRAC groups.",
      "Soaps, horticultural oils, and predatory mites help in IPM; avoid broad-spectrum sprays that kill beneficials if possible.",
    ],
  },
  Tomato___Target_Spot: {
    description:
      "Target spot (Corynespora cassiicola) causes dark lesions with concentric rings on tomato leaves and can affect fruit in humid production.",
    pesticides: [
      "Chlorothalonil, azoxystrobin, or premixes where labeled; follow resistance-management guidelines.",
      "Reduce leaf wetness, improve spacing, and remove crop debris after season.",
    ],
  },
  Tomato___Tomato_mosaic_virus: {
    description:
      "Tomato mosaic virus causes mottling, fern-leaf distortion, and stunting. There is no chemical cure; the pathogen spreads by contact, tools, seed, and sometimes chewing insects.",
    pesticides: [
      "No pesticide cures virus—sanitize tools and hands, remove infected plants early, and use TMV-resistant varieties where available.",
      "Control aphids only as secondary helpers; focus on hygiene and certified seed.",
    ],
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    description:
      "TYLCV is vectored chiefly by silverleaf whitefly (Bemisia). Leaves cup upward, yellow, and growth is stunted. Yield loss can be severe.",
    pesticides: [
      "Whitefly management: imidacloprid or other labeled systemic/neonicotinoid programs where permitted, plus spiromesifen, pyriproxyfen, or oils per IPM rotation.",
      "Reflective mulches, fine mesh, and TYLCV-resistant cultivars are critical in endemic areas.",
    ],
  },
};

export type DiseaseGuideResult = {
  description: string;
  pesticides: string[];
  isHealthy: boolean;
};

export function guideForPredictedClass(predictedClass: string): DiseaseGuideResult {
  const entry = DISEASE_GUIDE[predictedClass];
  if (entry) {
    return {
      description: entry.description,
      pesticides: entry.pesticides,
      isHealthy: predictedClass.endsWith("___healthy"),
    };
  }
  const plantKey = predictedClass.split("___")[0] ?? "";
  const { condition } = splitClassName(predictedClass);
  return {
    description: `${hintForPlant(plantKey)} Predicted label: ${condition || predictedClass}.`,
    pesticides: [
      "Ask your local extension service for products registered for this crop and problem in your region.",
    ],
    isHealthy: false,
  };
}
