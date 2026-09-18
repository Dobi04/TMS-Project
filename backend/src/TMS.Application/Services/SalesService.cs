using TMS.Application.DTOs.SalesDTOs;
using TMS.Application.Interfaces.Repositories;
using TMS.Application.Interfaces.Sales;
using TMS.Domain.Entities;
using SaleEntity = TMS.Domain.Entities.Sales;

namespace TMS.Application.Services
{
    public class SalesService : ISalesServices
    {
        #region Constants and Constructors
        private readonly ISalesRepository _salesRepository;
        private readonly ITyreRepository _tyreRepository;

        public SalesService(ISalesRepository salesRepository, ITyreRepository tyreRepository)
        {
            _salesRepository = salesRepository;
            _tyreRepository = tyreRepository;
        }
        #endregion

        #region QualitySupervisor Operations
        public async Task<List<SaleResponseDTO>> GetMySalesAsync(int registeredById)
        {
            var sales = await _salesRepository.FindByRegisteredByIdAsync(registeredById);
            return await ToResponseDtosAsync(sales);
        }

        public async Task<SaleResponseDTO> CreateSaleAsync(int registeredById, CreateSaleDTO dto)
        {
            var tyre = await _tyreRepository.FindByIdAsync(dto.TyreId)
                ?? throw new KeyNotFoundException("Tyre not found.");

            var sale = new SaleEntity
            {
                TyreId = dto.TyreId,
                RegisteredById = registeredById,
                QuantitySold = dto.QuantitySold,
                UnitOfMeasure = dto.UnitOfMeasure,
                SalePriceByUnit = dto.SalePriceByUnit,
                SaleDate = dto.SaleDate ?? DateTime.UtcNow,
                DestinationMarket = dto.DestinationMarket,
                PurchasingCompany = dto.PurchasingCompany
            };

            await _salesRepository.AddAsync(sale);
            await _salesRepository.SaveChangesAsync();

            return ToResponseDto(sale, tyre.Code);
        }
        #endregion

        #region BusinessUnitLeader Operations
        public async Task<List<SaleResponseDTO>> GetAllSalesAsync()
        {
            var sales = await _salesRepository.GetAllAsync();
            return await ToResponseDtosAsync(sales);
        }
        #endregion

        #region Helpers
        private async Task<List<SaleResponseDTO>> ToResponseDtosAsync(List<SaleEntity> sales)
        {
            var response = new List<SaleResponseDTO>();

            foreach (var sale in sales)
            {
                var tyre = await _tyreRepository.FindByIdAsync(sale.TyreId);
                response.Add(ToResponseDto(sale, tyre?.Code ?? string.Empty));
            }

            return response;
        }

        private static SaleResponseDTO ToResponseDto(SaleEntity sale, string tyreCode) => new()
        {
            Id = sale.Id,
            TyreId = sale.TyreId,
            TyreCode = tyreCode,
            QuantitySold = sale.QuantitySold,
            UnitOfMeasure = sale.UnitOfMeasure,
            SalePriceByUnit = sale.SalePriceByUnit,
            SaleDate = sale.SaleDate,
            DestinationMarket = sale.DestinationMarket,
            PurchasingCompany = sale.PurchasingCompany,
            RegisteredById = sale.RegisteredById,
            isActive = sale.isActive
        };
        #endregion
    }
}