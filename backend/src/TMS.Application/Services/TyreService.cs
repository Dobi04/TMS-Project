using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.TyreDTOs;
using TMS.Application.DTOs.Common;
using TMS.Application.Interfaces.Repositories;
using TMS.Application.Interfaces.Tyres;
using TMS.Domain.Entities;

namespace TMS.Application.Services
{
    public class TyreService : ITyreServices
    {
        #region Constants and Constructors
        private readonly ITyreRepository _tyreRepository;
        private readonly IMachineRepository _machineRepository;

        public TyreService(ITyreRepository tyreRepository, IMachineRepository machineRepository)
        {
            this._tyreRepository = tyreRepository;
            this._machineRepository = machineRepository;
        }
        #endregion

        #region ProductionOperator Operations Only
        public async Task<PagedResponseDTO<TyreResponseDTO>> GetMyTyresAsync(int operatorId, TyreFilterDTO filter)
        {
            return await GetPagedResponseAsync(filter, operatorId, activeOnly: true);
        }
        #endregion

        #region QualitySupervisor Operation Only
        public async Task<PagedResponseDTO<TyreResponseDTO>> GetAllTyresAsync(TyreFilterDTO filter)
        {
            return await GetPagedResponseAsync(filter);
        }

        public async Task<TyreResponseDTO> UpdateTyreAsync(int id, UpdateTyreDTO dto)
        {
            var tyre = await _tyreRepository.FindByIdAsync(id)
            ?? throw new KeyNotFoundException("Tyre not found.");

            var machine = await _machineRepository.FindByMachineNumberAsync(dto.MachineNumber);
            if (machine is null || !machine.IsActive)
                throw new KeyNotFoundException($"Machine with number {dto.MachineNumber} not found.");

            var duplicate = await _tyreRepository.FindByCodeAsync(dto.Code);
            if (duplicate != null && duplicate.Id != id)
                throw new InvalidOperationException("A tyre with this code already exists.");

            tyre.Code = dto.Code;
            tyre.QuantityProduced = dto.QuantityProduced;
            tyre.OperatorId = dto.OperatorId;
            tyre.ProductionDate = dto.ProductionDate;
            tyre.ProductionShift = dto.ProductionShift;
            tyre.MachineNumber = dto.MachineNumber;
            tyre.IsActive = dto.IsActive;

            await _tyreRepository.SaveChangesAsync();

            return ToResponseDto(tyre);

        }

        public async Task DeleteTyreAsync(int id)
        {
            var tyre = await _tyreRepository.FindByIdAsync(id)
            ?? throw new KeyNotFoundException("Tyre not found.");

            tyre.IsActive = false;

            await _tyreRepository.SaveChangesAsync();
        }
        #endregion

        #region Shared Operations
        public async Task<TyreResponseDTO> CreateTyreAsync(int operatorId, CreateTyreDTO dto)
        {
            var machine = await _machineRepository.FindByMachineNumberAsync(dto.MachineNumber);
            if (machine is null || !machine.IsActive)
                throw new KeyNotFoundException($"Machine with number {dto.MachineNumber} not found.");

            var existing = await _tyreRepository.FindByCodeAsync(dto.Code);
            if (existing != null)
                throw new InvalidOperationException("A tyre with this code already exists.");

            var tyre = new Tyre
            {
                Code = dto.Code,
                QuantityProduced = dto.QuantityProduced,
                OperatorId = operatorId,
                ProductionDate = dto.ProductionDate ?? DateTime.UtcNow,
                ProductionShift = dto.ProductionShift,
                MachineNumber = dto.MachineNumber
            };

            await _tyreRepository.AddAsync(tyre);
            await _tyreRepository.SaveChangesAsync();
            return ToResponseDto(tyre);
        }
        #endregion

        #region Helpers
        private async Task<PagedResponseDTO<TyreResponseDTO>> GetPagedResponseAsync(TyreFilterDTO filter, int? operatorScope = null, bool activeOnly = false)
        {
            if (filter.DateFrom.HasValue && filter.DateTo.HasValue && filter.DateFrom.Value.Date > filter.DateTo.Value.Date)
                throw new InvalidOperationException("Date from must be on or before date to.");

            var page = Math.Max(filter.Page, 1);
            var pageSize = filter.PageSize <= 0
                ? PaginationConstants.DefaultPageSize
                : Math.Clamp(filter.PageSize, 1, PaginationConstants.MaxPageSize);
            var result = await _tyreRepository.GetPagedAsync(filter, operatorScope, activeOnly);

            return new PagedResponseDTO<TyreResponseDTO>
            {
                Items = result.Items.Select(ToResponseDto).ToList(),
                TotalCount = result.TotalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = result.TotalCount == 0 ? 0 : (int)Math.Ceiling(result.TotalCount / (double)pageSize)
            };
        }

        private static TyreResponseDTO ToResponseDto(Tyre tyre) => new()
        {
            Id = tyre.Id,
            Code = tyre.Code,
            QuantityProduced = tyre.QuantityProduced,
            OperatorId = tyre.OperatorId,
            ProductionDate = tyre.ProductionDate,
            ProductionShift = tyre.ProductionShift.ToString(),
            MachineNumber = tyre.MachineNumber,
            IsActive = tyre.IsActive
        };
        #endregion

    }
}
