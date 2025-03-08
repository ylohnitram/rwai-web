export type Project = {
  id: string;
  name: string;
  type: string;
  blockchain: string;
  roi: number;
  description: string;
  tvl: string;
  auditUrl?: string;
  website: string;
  approved: boolean;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};
