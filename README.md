PharmaRoute 🧬

Transform Biomedical Research into Discoverable Knowledge Graph Intelligence

PharmaRoute is an AI-powered biomedical research intelligence platform that converts scientific papers into a living biomedical knowledge graph, enabling researchers to discover hidden drug-disease relationships, identify repurposing opportunities, and explore complex biological pathways through graph analytics and explainable AI.

🚀 Features
📄 Research Paper Ingestion
Upload biomedical PDFs and research papers
OCR and text extraction pipeline
Automated entity recognition
Subject-Predicate-Object (SPO) relationship extraction
🧠 AI-Powered Knowledge Extraction
Biomedical Named Entity Recognition (NER)
Relationship extraction using LLMs
Sarvam AI integration with OpenAI fallback
Explainable AI-generated insights
🌐 Neo4j Knowledge Graph

Builds a connected graph of:

Drugs
Diseases
Proteins
Genes
Biological Pathways
Research Papers

Supports:

Multi-hop relationship discovery
Path exploration
Similarity analysis
Graph traversal
💊 Drug Repurposing Engine

Discover novel treatment opportunities through graph analytics.

Example:

Drug → Protein → Pathway → Disease

Outputs:

Confidence scores
Evidence counts
Supporting biological pathways
Explainable recommendations
🎙 Voice Research Assistant

Natural language biomedical search:

"Show compounds linked to Alzheimer's disease."

"What proteins connect Metformin to Diabetes?"

Returns graph-backed explainable results.

📊 Research Intelligence Dashboard
Discovery feed
Emerging disease trends
Protein hotspot analysis
Research opportunity detection
📑 Automated Reports

Generate:

Research summaries
Discovery reports
Drug repurposing reports
PDF exports
🏗 System Architecture
Biomedical PDF
      │
      ▼
Text Extraction (OCR)
      │
      ▼
Entity Recognition
      │
      ▼
SPO Relationship Extraction
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
Research Dashboard & Voice Assistant
🛠 Tech Stack
Frontend
Expo React Native
TypeScript
Expo Router
React Query
Zustand
React Native SVG
Backend
Node.js
Express
TypeScript
Database
Neo4j AuraDB
AI Layer
Sarvam AI
OpenAI
Storage
Cloudinary
Workflow & Automation
Base44
DevOps
Docker
GitHub Actions
Render
📂 Project Structure
PharmaRoute/
│
├── frontend/
│   ├── app/
│   ├── src/
│   ├── components/
│   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── graph/
│   │   ├── middleware/
│   │   └── config/
│   │
│   └── scripts/
│
├── docs/
│
├── docker/
│
└── .github/
🧬 Knowledge Graph Model
Nodes
(:Drug)
(:Disease)
(:Protein)
(:Gene)
(:Pathway)
(:Paper)
Relationships
TREATS
TARGETS
INHIBITS
ACTIVATES
CAUSES
ASSOCIATED_WITH
INTERACTS_WITH
⚡ Getting Started
Prerequisites
Node.js 20+
Neo4j AuraDB
Docker (optional)
Expo CLI
Backend Setup
cd backend

npm install

cp .env.example .env

npm run dev
Frontend Setup
cd frontend

npm install

npx expo start
Environment Variables
Backend
PORT=5000

JWT_SECRET=

NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

OPENAI_API_KEY=

SARVAM_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
📈 Drug Repurposing Workflow
Drug
 │
 ▼
Target Protein
 │
 ▼
Biological Pathway
 │
 ▼
Disease

The system evaluates:

Path confidence
Supporting evidence
Relationship strength
Literature support

to identify promising repurposing opportunities.

🔍 Example Queries
Graph Search
Show compounds associated with Alzheimer's disease.
Discovery Query
Find drugs connected to Parkinson's through inflammation pathways.
Voice Query
What proteins connect Metformin and Type 2 Diabetes?
📊 Core Analytics
Shortest Path Discovery
Node Similarity
Community Detection
Centrality Analysis
Multi-Hop Exploration
Research Trend Analysis
🚀 Deployment
Docker
docker-compose up --build
Render

Deploy:

Backend Service
Frontend Service
Environment Variables
Neo4j AuraDB Connection
🎯 Hackathon Highlights
Why PharmaRoute?

Biomedical research is fragmented across millions of papers.

PharmaRoute converts unstructured literature into a living knowledge graph that enables:

Faster discovery
Better literature navigation
Drug repurposing insights
Explainable AI research assistance
🔮 Future Roadmap
Clinical trial integration
PubMed synchronization
Multi-modal biomedical data
Research collaboration workspaces
Real-time discovery alerts
Advanced graph embeddings
👥 Team

Built for innovation in biomedical knowledge discovery and AI-powered healthcare research.

📜 License

MIT License

🏆 Hackathon Tracks

✅ Expo React Native
✅ Neo4j AuraDB
✅ Base44
✅ AI-Powered Knowledge Discovery
✅ Graph Analytics
✅ Drug Repurposing Intelligence
