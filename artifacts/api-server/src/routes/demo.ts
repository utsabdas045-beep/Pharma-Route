import { Router } from "express";
import { runQuery, initConstraints } from "../lib/neo4j";

const router = Router();

const COMPOUNDS = [
  "Metformin", "Rapamycin", "Ibuprofen", "Aspirin", "Simvastatin",
  "Doxycycline", "Hydroxychloroquine", "Ivermectin", "Berberine", "Resveratrol",
  "Curcumin", "Quercetin", "Melatonin", "NAD+", "Spermidine",
  "Lithium", "Valproate", "Ketamine", "Psilocybin", "CBD",
  "Ritonavir", "Remdesivir", "Baricitinib", "Tocilizumab", "Dexamethasone",
  "Semaglutide", "Liraglutide", "Empagliflozin", "Losartan", "Atorvastatin",
  "Tamoxifen", "Imatinib", "Trastuzumab", "Bevacizumab", "Pembrolizumab",
  "Levodopa", "Donepezil", "Riluzole", "Natalizumab", "Fingolimod",
  "Thalidomide", "Lenalidomide", "Bortezomib", "Rituximab", "Ibrutinib",
  "Azithromycin", "Doxorubicin", "Cisplatin", "Paclitaxel", "Carboplatin",
];

const PROTEINS = [
  "AMPK", "mTOR", "p53", "BRCA1", "BRCA2", "EGFR", "HER2", "PD-1", "PD-L1", "CTLA-4",
  "COX-1", "COX-2", "TNF-α", "IL-6", "IL-1β", "NF-κB", "Akt", "PI3K", "PTEN", "RAS",
  "BRAF", "MEK", "ERK", "VEGF", "FGFR", "ALK", "RET", "MET", "CDK4", "CDK6",
  "BCL-2", "BCL-XL", "BAX", "Caspase-3", "PARP", "HDAC", "HAT", "DNMT", "TET", "EZH2",
  "SOD1", "TDP-43", "FUS", "C9orf72", "SNCA", "LRRK2", "Tau", "APP", "BACE1", "ApoE",
  "ACE2", "Spike", "TMPRSS2", "Furin", "NLRP3", "Caspase-1", "IL-18", "Gasdermin", "STING", "cGAS",
  "GLP-1R", "DPP4", "SGLT2", "GLP-2R", "PPARγ", "PPARα", "LXR", "FXR", "RXR", "TGF-β",
  "SMAD2", "SMAD3", "SMAD4", "RUNX2", "Sox9", "Wnt", "β-catenin", "Notch", "Hedgehog", "YAP",
  "HIF-1α", "VEGFR", "PDGFR", "c-Kit", "FLT3", "JAK1", "JAK2", "STAT3", "STAT6", "IRF3",
  "MYC", "MAX", "MAD", "SP1", "E2F", "Rb", "MDM2", "ATM", "ATR", "CHK1",
];

const DISEASES = [
  "Alzheimer's Disease", "Parkinson's Disease", "ALS", "Multiple Sclerosis", "Huntington's Disease",
  "Type 2 Diabetes", "Obesity", "NAFLD", "Metabolic Syndrome", "Atherosclerosis",
  "Breast Cancer", "Colorectal Cancer", "Lung Cancer", "Pancreatic Cancer", "Glioblastoma",
  "COVID-19", "Influenza", "Hepatitis B", "HIV/AIDS", "Tuberculosis",
  "Rheumatoid Arthritis", "Lupus", "Crohn's Disease", "Psoriasis", "Asthma",
  "Heart Failure", "Atrial Fibrillation", "Hypertension", "Stroke", "Myocardial Infarction",
];

const PATHWAYS = [
  "mTOR Signaling", "PI3K/Akt", "MAPK/ERK", "Wnt/β-catenin", "Notch Signaling",
  "NF-κB", "JAK/STAT", "TGF-β", "Hedgehog", "Hippo/YAP",
  "Autophagy", "Apoptosis", "Ferroptosis", "Pyroptosis", "Necroptosis",
  "Neuroinflammation", "Oxidative Stress", "ER Stress", "Unfolded Protein Response", "Mitophagy",
  "Glycolysis", "TCA Cycle", "Fatty Acid Oxidation", "Glutaminolysis", "One-Carbon Metabolism",
  "DNA Repair", "Cell Cycle", "Senescence", "Telomere Maintenance", "Chromatin Remodeling",
];

const RELS = ["INHIBITS", "ACTIVATES", "CAUSES", "TREATS", "TARGETS", "ASSOCIATED_WITH", "INTERACTS_WITH"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

router.post("/demo/seed", async (req, res) => {
  try {
    await initConstraints();

    for (const c of COMPOUNDS) {
      await runQuery("MERGE (n:Compound {name: $name}) SET n.mw = $mw, n.aliases = []", {
        name: c,
        mw: Math.floor(Math.random() * 800 + 100),
      });
    }

    for (const p of PROTEINS) {
      await runQuery("MERGE (n:Protein {name: $name}) SET n.function = $fn", {
        name: p,
        fn: "Biomedical protein target",
      });
    }

    for (const d of DISEASES) {
      await runQuery("MERGE (n:Disease {name: $name}) SET n.icd = $icd", {
        name: d,
        icd: `D${Math.floor(Math.random() * 900 + 100)}`,
      });
    }

    for (const pw of PATHWAYS) {
      await runQuery("MERGE (n:Pathway {name: $name})", { name: pw });
    }

    // Create relationships
    for (let i = 0; i < 200; i++) {
      const relType = pick(RELS);
      const rand = Math.random();
      try {
        if (rand < 0.3) {
          await runQuery(
            `MERGE (a:Compound {name: $from}) MERGE (b:Protein {name: $to})
             MERGE (a)-[:${relType} {confidence: $conf}]->(b)`,
            { from: pick(COMPOUNDS), to: pick(PROTEINS), conf: Math.random() * 0.5 + 0.5 }
          );
        } else if (rand < 0.5) {
          await runQuery(
            `MERGE (a:Protein {name: $from}) MERGE (b:Disease {name: $to})
             MERGE (a)-[:ASSOCIATED_WITH {confidence: $conf}]->(b)`,
            { from: pick(PROTEINS), to: pick(DISEASES), conf: Math.random() * 0.5 + 0.5 }
          );
        } else if (rand < 0.7) {
          await runQuery(
            `MERGE (a:Protein {name: $from}) MERGE (b:Pathway {name: $to})
             MERGE (a)-[:ACTIVATES {confidence: $conf}]->(b)`,
            { from: pick(PROTEINS), to: pick(PATHWAYS), conf: Math.random() * 0.5 + 0.5 }
          );
        } else {
          await runQuery(
            `MERGE (a:Pathway {name: $from}) MERGE (b:Disease {name: $to})
             MERGE (a)-[:CAUSES {confidence: $conf}]->(b)`,
            { from: pick(PATHWAYS), to: pick(DISEASES), conf: Math.random() * 0.5 + 0.5 }
          );
        }
      } catch {
        // skip duplicate relationship errors
      }
    }

    // Seed papers
    const papers = [
      { title: "mTOR inhibition in neurodegeneration", abstract: "Rapamycin reduces tau accumulation" },
      { title: "Metformin and cognitive decline", abstract: "AMPK activation protects neurons" },
      { title: "COX-2 in Parkinson pathology", abstract: "Neuroinflammation drives α-synuclein" },
      { title: "Statin pleiotropic effects", abstract: "Beyond cholesterol: anti-cancer mechanisms" },
      { title: "CRISPR therapeutic applications", abstract: "Gene editing for monogenic diseases" },
      { title: "GLP-1 receptor agonists and brain", abstract: "Neuroprotective effects of semaglutide" },
      { title: "Ferroptosis in cancer therapy", abstract: "Iron-dependent cell death as target" },
      { title: "Autophagy and longevity", abstract: "Spermidine extends healthspan via autophagy" },
      { title: "JAK inhibitors in autoimmunity", abstract: "Baricitinib efficacy in RA and beyond" },
      { title: "CBD neuroprotection", abstract: "Cannabidiol anti-inflammatory mechanisms" },
    ];
    for (const paper of papers) {
      const id = `paper-${Math.random().toString(36).slice(2)}`;
      await runQuery(
        `MERGE (p:Paper {paperId: $id}) SET p.id = $id, p.title = $title, p.abstract = $abstract,
         p.status = 'completed', p.entitiesExtracted = $ec, p.relationshipsExtracted = $rc,
         p.createdAt = $now, p.authors = []`,
        {
          id,
          title: paper.title,
          abstract: paper.abstract,
          ec: Math.floor(Math.random() * 30 + 10),
          rc: Math.floor(Math.random() * 50 + 20),
          now: new Date().toISOString(),
        }
      );
    }

    res.json({
      compounds: COMPOUNDS.length,
      proteins: PROTEINS.length,
      diseases: DISEASES.length,
      pathways: PATHWAYS.length,
      relationships: 200,
      papers: papers.length,
    });
  } catch (err) {
    req.log.error({ err }, "seedDemoData failed");
    res.status(500).json({ error: String(err) });
  }
});

export default router;
