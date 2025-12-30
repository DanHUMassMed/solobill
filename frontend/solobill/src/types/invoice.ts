import { Client } from "./client";
import { Consultant } from "./Consultant";
import { Project } from "./project";

export interface InvoiceLineItem {
  id: string | number;
  dateDesc: string;
  workDesc: string;
  hours: string | number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO String
  
  // Snapshots - Consultant
  consultant: Consultant;

  // Snapshots - Client
  client: Client;
  
  // Snapshots - Project
  project: Project;
  
  // Invoice Details
  invoiceLineItems: InvoiceLineItem[];
}