# 🧬 PharmaRoute

### AI-Powered Biomedical Knowledge Discovery & Drug Repurposing Platform

PharmaRoute transforms unstructured biomedical literature into a living knowledge graph that helps researchers discover hidden relationships between drugs, proteins, pathways, and diseases.

By combining AI-powered document understanding, Neo4j graph analytics, and explainable drug repurposing workflows, PharmaRoute enables researchers to explore biomedical knowledge faster than traditional literature review methods.

---

# 🚀 Problem

Biomedical research is growing at an unprecedented rate.

Researchers face:

* Millions of published papers
* Fragmented scientific knowledge
* Hidden relationships across studies
* Time-consuming literature reviews
* Missed drug repurposing opportunities

Traditional search systems return documents.

Researchers need discoveries.

---

# 💡 Solution

PharmaRoute converts biomedical papers into an interconnected knowledge graph.

Instead of reading hundreds of papers manually, researchers can:

* Upload research papers
* Extract biomedical entities automatically
* Build relationship graphs
* Explore biological pathways
* Discover hidden drug-disease connections
* Generate explainable research insights

---

# 🏗️ Architecture

```text
Biomedical PDF
        │
        ▼
Document Extraction
        │
        ▼
Entity Recognition
        │
        ▼
Relationship Extraction
        │
        ▼
Neo4j Knowledge Graph
        │
        ▼
Graph Analytics Engine
        │
        ▼
Drug Repurposing Discovery
        │
        ▼
Research Dashboard
```

---

# 🧠 Core Features

## 📄 Research Paper Ingestion

Upload:

* PDF papers
* Research documents
* Biomedical publications

Pipeline:

```text
PDF
→ OCR
→ Text Extraction
→ Entity Recognition
→ SPO Triplets
→ Neo4j Graph
```

---

## 🌐 Biomedical Knowledge Graph

PharmaRoute builds a graph connecting:

### Nodes

* Drug
* Disease
* Protein
* Gene
* Pathway
* Paper

### Relationships

* TREATS
* TARGETS
* INHIBITS
* ACTIVATES
* ASSOCIATED_WITH
* INTERACTS_WITH
* CAUSES

This creates an evolving biomedical knowledge network.

---

## 💊 Drug Repurposing Engine

The flagship feature.

PharmaRoute identifies hidden therapeutic opportunities through graph traversal.

Example:

```text
Drug
  ↓
Protein
  ↓
Pathway
  ↓
Disease
```

Outputs:

* Confidence Score
* Supporting Evidence
* Biological Pathway
* Research Citations
* Explainable Reasoning

---

## 🎙 Voice Research Assistant

Researchers can ask:

> Show drugs linked to Alzheimer's disease

> What proteins connect Metformin to Type 2 Diabetes?

The assistant converts natural language into graph-powered biomedical queries.

---

## 📊 Research Intelligence Dashboard

Discover:

* Emerging proteins
* Trending diseases
* Research hotspots
* High-value pathways
* Drug opportunities

---

## 📑 Automated Reports

Generate:

* Discovery Reports
* Research Summaries
* Drug Repurposing Reports
* PDF Exports

---

# 🛠️ Technology Stack

## Frontend

* Expo React Native
* TypeScript
* Expo Router
* React Query
* Zustand

## Backend

* Node.js
* Express
* TypeScript

## Database

* Neo4j AuraDB

## Artificial Intelligence

* Sarvam AI
* OpenAI

## Cloud & DevOps

* Render
* Docker
* GitHub Actions

---

# 📂 Project Structure

```text
PharmaRoute/
│
├── frontend/
│   ├── app/
│   ├── src/
│   ├── components/
│   └── assets/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── graph/
│   ├── middleware/
│   └── config/
│
├── docs/
├── docker/
└── .github/
```

---

# 🔬 Graph Analytics

PharmaRoute supports:

* Shortest Path Discovery
* Multi-Hop Exploration
* Similarity Analysis
* Community Detection
* Centrality Metrics
* Evidence Aggregation

These analytics power discovery and repurposing recommendations.

---

# 🚀 Getting Started

## Backend

```bash
cd backend

npm install

cp .env.example .env

npm run dev
```

## Frontend

```bash
cd frontend

npm install

npx expo start
```

---

# 🔐 Environment Variables

```env
JWT_SECRET=

NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

OPENAI_API_KEY=

SARVAM_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 🎯 Why PharmaRoute?

Most research tools help users search.

PharmaRoute helps users discover.

By combining AI, graph databases, and explainable biomedical analytics, PharmaRoute turns isolated scientific papers into a connected intelligence network capable of uncovering relationships that may otherwise remain hidden.

---

# 🏆 Hackathon Highlights

✅ AI-Powered Knowledge Extraction

✅ Neo4j Graph Analytics

✅ Drug Repurposing Discovery

✅ Voice-Based Biomedical Search

✅ Explainable AI Insights

✅ Research Intelligence Dashboard

✅ Mobile-First Experience

---

# 🔮 Future Roadmap

* PubMed Integration
* Clinical Trial Knowledge Graphs
* Graph Embeddings
* Research Collaboration Workspaces
* Real-Time Discovery Alerts
* Enterprise Analytics

---

# 👥 Team

Built for researchers, scientists, and innovators advancing biomedical discovery through AI and graph intelligence.

---

# 📜 License

MIT License
