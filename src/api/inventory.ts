// src/api/inventory.ts
import api from "./client";

export type MovementType =
  | "Initial"
  | "Purchase"
  | "Sale"
  | "Adjustment"
  | "Return"
  | "Damage";

export interface InventoryLog {
  log_id: number;
  product_id: number;
  product_name: string | null;
  change_type: MovementType | string;
  quantity_change: number;
  remarks: string;
  date_time: string;
  current_stock?: number | null;
}

// GET /inventory
export async function getInventoryLogs(): Promise<InventoryLog[]> {
  const res = await api.get<InventoryLog[]>("/inventory");
  return res.data;
}

// POST /inventory  – manual stock movement
export async function addInventoryLog(params: {
  product_id: number;
  change_type: MovementType;
  quantity_change: number;
  remarks?: string;
}) {
  const res = await api.post("/inventory", params);
  return res.data;
}
