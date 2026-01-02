import { Client } from "./client";
import { Consultant } from "./consultant";
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
  totalHours: string | number;
  totalAmount: string | number;
  consultant: Consultant;
  client: Client;
  project: Project;
  lineItems: InvoiceLineItem[];
}