using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.TireDTOs;
using TMS.Application.DTOs.TyreDTOs;
using TMS.Application.Interfaces.Project_Functionality;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;

namespace TMS.Application.Services
{
    public class TyreService : ITyreServices
    {
        #region Constants and Constructors
        private readonly ITyreRepository _tyreRepository;

        public TyreService(ITyreRepository tyreRepository)
        {
            this._tyreRepository = tyreRepository;
        }
        #endregion

        #region ProductionOperator Operations Only
        public async Task<List<TyreResponseDTO>> GetMyTyresAsync(int operatorId)
        {
            var tyres = await _tyreRepository.FindByIdAsync(operatorId);
            return tyres.Selelct(ToResponseDto).ToList();
        }
        #endregion

        #region QualitySupervisor Operation Only
        public async Task<List<TyreResponseDTO>> GetAllTyresAsync()
        {
            var tyres = await _tyreRepository.GetAllAsync();
            return tyres.Select(ToResponseDto).ToList();
        }

        public async Task<TyreResponseDTO> UpdateTyreAsync(int id, UpdateTyreDTO dto)
        {
            var tyre = await _tyreRepository.FindByIdAsync(id)
            ?? throw new KeyNotFoundException("Tyre not found.");

            var duplicate = await _tyreRepository.FindByCodeAsync(dto.Code);
            if (duplicate != null && duplicate.Id != id)
                throw new InvalidOperationException("A tyre with this code already exists.");

            tyre.Code = dto.Code;
            tyre.QuantityProduced = dto.QuantityProduced;
            tyre.OperatorId = dto.OperatorId;
            tyre.ProductionDate = dto.ProductionDate;
            tyre.ProductionShift = dto.ProductionShift;
            tyre.MachineNumber = dto.MachineNumber;
            tyre.isActive = dto.isActive;

            await _tyreRepository.SaveChangesAsync();

            return ToResponseDto(tyre);

        }
        #endregion

        #region Shared Operations
        public async Task<TyreResponseDTO> CreateTyreAsync(int operatorId, CreateTyreDTO dto)
        {
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
        private static TyreResponseDTO ToResponseDto(Tyre tyre) => new()
        {
            Id = tyre.Id,
            Code = tyre.Code,
            QuantityProduced = tyre.QuantityProduced,
            OperatorId = tyre.OperatorId,
            ProductionDate = tyre.ProductionDate,
            ProductionShift = tyre.ProductionShift.ToString(),
            MachineNumber = tyre.MachineNumber,
            isActive = tyre.isActive
        };
        #endregion

    }
}
