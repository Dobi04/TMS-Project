export type TyreEntry = {
  id: number;
  code: string;
  quantityProduced: number;
  operatorId: number;
  productionDate: string;
  productionShift: string;
  machineNumber: number;
  isActive: boolean;
};

export type TyreFilter = {
  code?: string;
  operatorId?: number;
  shift?: number;
  machineNumber?: number;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
};
