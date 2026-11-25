"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteBill,
  getBill,
  getBills,
  getCategories,
  updateBill,
} from "@/lib/api";
import type { BillQuery, BillUpdate } from "@/lib/types";

// ขอรายการบิล (ตามช่วงเวลา)
export function useBills(query: BillQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ["bills", "list", query],
    queryFn: () => getBills(query),
    enabled,
  });
}

// ขอบิลใบเดียว
export function useBill(id: string) {
  return useQuery({
    queryKey: ["bills", "detail", id],
    queryFn: () => getBill(id),
  });
}

// ขอรายการหมวดหมู่
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

// สั่งแก้บิล
export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: BillUpdate }) =>
      updateBill(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

// สั่งลบบิล
export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}