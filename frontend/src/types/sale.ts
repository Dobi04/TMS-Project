export type Sale = {
  id: number;
  tyreId: number;
  tyreCode: string;
  quantitySold: number;
  unitOfMeasure: string;
  salePriceByUnit: number;
  saleDate: string;
  destinationMarket: string;
  purchasingCompany: string;
  registeredById: number;
  isActive: boolean;
};

export type SaleFilter = {
  tyreCode?: string;
  destinationMarket?: string;
  purchasingCompany?: string;
  registeredById?: number;
  dateFrom?: string;
  dateTo?: string;
};
