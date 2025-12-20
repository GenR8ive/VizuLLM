# VizuLLM

## 🚀 An Open-Source, Schema-Driven Rendering Engine for LLM-Generated Documents

VizuLLM turns **structured LLM outputs** into **real, deterministic documents and visual artifacts**.

Instead of asking an LLM to *write text*, VizuLLM enables LLMs to **generate data for a document type**, which is then rendered reliably using a strict schema contract.

This makes LLM-powered systems predictable, printable, and production-ready.

---

## ❓ Why VizuLLM Exists

Large Language Models are excellent at generating text, but most real-world applications don’t need paragraphs — they need **documents**.

Invoices. Timelines. Guides. Schedules. Diagrams.

VizuLLM introduces a missing layer between LLMs and user-facing outputs:

* The **LLM** generates structured JSON
* The **schema** defines the document contract
* **VizuLLM** renders a deterministic artifact

This separation allows LLMs to be used as **content generators**, not document designers.

---

## 🧭 What VizuLLM Is 

* A schema-driven rendering engine
* A document and artifact generation layer for LLM-powered products
* An open-source ecosystem of document renderers

---

## 🧩 Core Concept

VizuLLM is built around a simple contract:

1. **Choose a document type** (e.g. timetable, invoice, guide)
2. **Provide its schema to an LLM**
3. **Receive structured JSON output**
4. **Render a finished document** using VizuLLM

The same schema will always produce the same document structure — regardless of which LLM is used.

---

## ⚙️ How It Works

```
LLM → Structured JSON → Schema Validation → Renderer → Document / PDF / Visual Artifact
```

Schemas are defined using **Zod**, ensuring:

* Type safety
* Validation
* Deterministic output

---

## ✨ Getting Started (End Users)

1. **Browse Document Types** available in VizuLLM
2. **Select an artifact** that matches your need
3. **Copy the schema contract**
4. **Ask an LLM** to generate data following that schema
5. **Paste the JSON output** into VizuLLM
6. **Edit content inline** by double-clicking any text element
7. **Export** a ready-to-use document or PDF

### ✏️ Editing Features

VizuLLM includes powerful inline editing capabilities:

* **Double-click to edit** - Edit any text element directly in the preview
* **Context menu** - Right-click or single-click for edit/delete options
* **Undo/Redo** - Track changes with undo functionality
* **Fullscreen mode** - Edit in distraction-free fullscreen view
* **Better Print** - Prevent sections from being cut across pages when printing
* **Real-time sync** - Changes sync automatically between normal and fullscreen views

### Example Workflow

```
1. Choose the "Weekly Timetable" document type
2. Copy its schema
3. Ask the LLM to generate timetable data
4. Paste the JSON output into VizuLLM
5. Receive a printable timetable
```

---

## 🛠️ For Developers – Creating Document Renderers

Every contribution to VizuLLM adds a **new document or artifact type** that LLMs can reliably generate.

### Quick Start

```bash
git clone https://github.com/genr8ive/VizuLLM.git
cd VizuLLM
npm install
npm run generate-visual
```

The generator will guide you through:

* Naming your document type
* Defining its schema
* Creating a renderer
* Attribution

---

## Renderer Structure

Each document renderer includes:

* **component.tsx** – Renders the document
* **schema.ts** – Zod schema defining the contract
* **sample-data.json** – Example input
* **metadata.json** – Renderer metadata

### Example Schema

```ts
import { z } from 'zod';

export const DocumentSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    })
  ),
});
```

---

## 📚 Available Document Types

### Planning & Scheduling

* Weekly Timetable
* Weekly / Monthly Agenda

### Business Documents

* Invoice (Modern)
* Cover Letter

### Diagrams & Data

* Coming soon

### Creative Artifacts

* Coming soon

---

## 🤝 Contribution Philosophy

VizuLLM is **not a generic UI component library**.

Contributions should represent **document or artifact types** that:

* Have a clear schema contract
* Can be generated deterministically by an LLM
* Produce a real, usable output

UI creativity is welcome — but structure and reliability come first.

---

## 🗂️ Project Structure

```
VizuLLM/
├── src/
├── visuals/
│   ├── component-template/
│   ├── weekly-timetable/
│   └── list.json
├── public/
└── package.json
```

---

## 📄 License

MIT License

---

## 🔮 Vision

VizuLLM aims to standardize how LLMs produce documents.

As the ecosystem grows, LLMs won’t just *write* — they’ll generate **structured artifacts** that plug directly into real products.

---

**Built by the VizuLLM community**
