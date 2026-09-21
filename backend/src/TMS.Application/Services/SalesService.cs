using TMS.Application.DTOs.SalesDTOs;
using TMS.Application.DTOs.Common;
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
        public async Task<PagedResponseDTO<SaleResponseDTO>> GetMySalesAsync(int registeredById, SaleFilterDTO filter)
        {
            return await GetPagedResponseAsync(filter, registeredById, activeOnly: true);
        }

        public async Task<SaleResponseDTO> CreateSaleAsync(int registeredById, CreateSaleDTO dto)
        {
            var code = dto.TyreCode.Trim();
            var tyre = await _tyreRepository.FindByCodeAsync(code);
            if (tyre is null || !tyre.IsActive)
                throw new KeyNotFoundException($"Tyre with code '{code}' not found.");

            var alreadySold = await _salesRepository.GetTotalSoldForTyreAsync(tyre.Id);
            var available = tyre.QuantityProduced - alreadySold;
            if (dto.QuantitySold > available)
                throw new InvalidOperationException($"Cannot sell {dto.QuantitySold} units of tyre '{tyre.Code}' — only {available} are currently in stock.");

            var sale = new SaleEntity
            {
                TyreId = tyre.Id,
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
        public async Task<PagedResponseDTO<SaleResponseDTO>> GetAllSalesAsync(SaleFilterDTO filter)
        {
            return await GetPagedResponseAsync(filter);
        }
        #endregion

        #region Helpers
        private async Task<PagedResponseDTO<SaleResponseDTO>> GetPagedResponseAsync(SaleFilterDTO filter, int? registeredByScope = null, bool activeOnly = false)
        {
            if (filter.DateFrom.HasValue && filter.DateTo.HasValue && filter.DateFrom.Value.Date > filter.DateTo.Value.Date)
                throw new InvalidOperationException("Date from must be on or before date to.");

            var page = Math.Max(filter.Page, 1);
            var pageSize = filter.PageSize <= 0
                ? PaginationConstants.DefaultPageSize
                : Math.Clamp(filter.PageSize, 1, PaginationConstants.MaxPageSize);
            var result = await _salesRepository.GetPagedAsync(filter, registeredByScope, activeOnly);

            return new PagedResponseDTO<SaleResponseDTO>
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = result.TotalCount == 0 ? 0 : (int)Math.Ceiling(result.TotalCount / (double)pageSize)
            };
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
            IsActive = sale.IsActive
        };
        #endregion
    }
}