export interface DocumentFile {
  id: string;
  name: string;
  type: "PDF" | "Word" | "Excel" | "Image";
  tags: string[];
  modified: string;
  section: "uploads" | "templates";
  category?: string;
}

export const userDocuments: DocumentFile[] = [
  {
    id: "1",
    name: "2024 Financial Report.pdf",
    type: "PDF",
    tags: ["2024 financials", "IRS"],
    modified: "Oct 10, 2024",
    section: "uploads",
    category: "Financial reports",
  },
  {
    id: "2",
    name: "Community Impact Application 2023.docx",
    type: "Word",
    tags: ["past application"],
    modified: "Sep 28, 2024",
    section: "uploads",
    category: "Past applications",
  },
  {
    id: "3",
    name: "501c3 Determination Letter.pdf",
    type: "PDF",
    tags: ["org documents"],
    modified: "Jan 15, 2024",
    section: "uploads",
    category: "Org documents",
  },
];

export const templateDocuments: DocumentFile[] = [
  {
    id: "t1",
    name: "Budget Template.xlsx",
    type: "Excel",
    tags: ["template"],
    modified: "GrantClient",
    section: "templates",
  },
  {
    id: "t2",
    name: "Mission Statement Template.docx",
    type: "Word",
    tags: ["template"],
    modified: "GrantClient",
    section: "templates",
  },
  {
    id: "t3",
    name: "Impact Report Template.docx",
    type: "Word",
    tags: ["template"],
    modified: "GrantClient",
    section: "templates",
  },
];
