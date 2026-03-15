export interface Question {
  id: string;
  label: string;
  prompt: string;
}

export const QUESTIONS: Question[] = [
  // --- High-signal questions: base model hedges or gives stale/generic answers ---

  {
    id: 'crm',
    label: 'CRM',
    prompt:
      'What CRM updates were included in the ServiceNow Yokohama release?',
  },
  {
    id: 'raptordb',
    label: 'RaptorDB',
    prompt: 'What are the key features of RaptorDB for ServiceNow?',
  },

  {
    id: 'data-fabric',
    label: 'Workflow Data Fabric',
    prompt:
      'What are the key features and improvements in Workflow Data Fabric for ServiceNow?',
  },
  {
    id: 'itsm-updates',
    label: 'ITSM updates',
    prompt: 'What changed for ITSM in the Washington DC release?',
  },
  {
    id: 'service-graph-connector-aws',
    label: 'Service Graph Connector for AWS',
    prompt:
      'What are the exact system requirements and configuration steps for the Service Graph Connector for AWS in ServiceNow?',
  },
];
