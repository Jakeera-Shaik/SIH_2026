package com.sih.marketlink.service;

import com.sih.marketlink.dto.offer.CounterOfferRequest;
import com.sih.marketlink.dto.offer.CreateOfferRequest;
import com.sih.marketlink.dto.offer.OfferResponse;
import com.sih.marketlink.entity.*;
import com.sih.marketlink.exception.BadRequestException;
import com.sih.marketlink.exception.ResourceNotFoundException;
import com.sih.marketlink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final BuyerProfileRepository buyerProfileRepository;
    private final CropRepository cropRepository;
    private final BuyerRequirementRepository buyerRequirementRepository;

    public OfferService(
            OfferRepository offerRepository,
            FarmerProfileRepository farmerProfileRepository,
            BuyerProfileRepository buyerProfileRepository,
            CropRepository cropRepository,
            BuyerRequirementRepository buyerRequirementRepository
    ) {
        this.offerRepository = offerRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.buyerProfileRepository = buyerProfileRepository;
        this.cropRepository = cropRepository;
        this.buyerRequirementRepository = buyerRequirementRepository;
    }

    @Transactional
    public OfferResponse createOffer(CreateOfferRequest request, Long userId) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for authenticated user"));

        BuyerProfile buyer = buyerProfileRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with id: " + request.getBuyerId()));

        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + request.getCropId()));

        BuyerRequirement req = null;
        if (request.getRequirementId() != null) {
            req = buyerRequirementRepository.findById(request.getRequirementId()).orElse(null);
        }

        double totalAmount = (request.getQuantity() / 100.0) * request.getPricePerUnit();

        Offer offer = Offer.builder()
                .farmer(farmer)
                .buyer(buyer)
                .requirement(req)
                .crop(crop)
                .quantity(request.getQuantity())
                .pricePerUnit(request.getPricePerUnit())
                .totalAmount(totalAmount)
                .message(request.getMessage())
                .status("PENDING")
                .build();

        Offer saved = offerRepository.save(offer);
        return mapToDto(saved);
    }

    public List<OfferResponse> getFarmerOffers(Long userId, String status) {
        FarmerProfile farmer = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        List<Offer> list = (status != null && !status.equalsIgnoreCase("ALL"))
                ? offerRepository.findByFarmerIdAndStatusOrderByCreatedAtDesc(farmer.getId(), status.toUpperCase())
                : offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());

        return list.stream().map(this::mapToDto).toList();
    }

    public List<OfferResponse> getBuyerOffers(Long userId, String status) {
        BuyerProfile buyer = buyerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        List<Offer> list = (status != null && !status.equalsIgnoreCase("ALL"))
                ? offerRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(buyer.getId(), status.toUpperCase())
                : offerRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());

        return list.stream().map(this::mapToDto).toList();
    }

    public OfferResponse getOfferById(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));
        return mapToDto(offer);
    }

    @Transactional
    public OfferResponse acceptOffer(Long id, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));
        offer.setStatus("ACCEPTED");
        return mapToDto(offerRepository.save(offer));
    }

    @Transactional
    public OfferResponse rejectOffer(Long id, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));
        offer.setStatus("REJECTED");
        return mapToDto(offerRepository.save(offer));
    }

    @Transactional
    public OfferResponse counterOffer(Long id, CounterOfferRequest request, Long userId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + id));
        offer.setPricePerUnit(request.getCounterPrice());
        offer.setTotalAmount((offer.getQuantity() / 100.0) * request.getCounterPrice());
        offer.setStatus("COUNTERED");
        if (request.getMessage() != null) {
            offer.setMessage(request.getMessage());
        }
        return mapToDto(offerRepository.save(offer));
    }

    public OfferResponse mapToDto(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .farmerId(offer.getFarmer().getId())
                .farmerName(offer.getFarmer().getUser().getName())
                .buyerId(offer.getBuyer().getId())
                .buyerName(offer.getBuyer().getBusinessName())
                .requirementId(offer.getRequirement() != null ? offer.getRequirement().getId() : null)
                .cropId(offer.getCrop().getId())
                .cropName(offer.getCrop().getName())
                .quantity(offer.getQuantity())
                .pricePerUnit(offer.getPricePerUnit())
                .totalAmount(offer.getTotalAmount())
                .message(offer.getMessage())
                .status(offer.getStatus())
                .createdAt(offer.getCreatedAt())
                .updatedAt(offer.getUpdatedAt())
                .build();
    }
}
