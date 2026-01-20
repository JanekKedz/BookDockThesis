package pw.react.backend.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data transfer object for DockingSpot")
public class DockingSpotDto {

    @Schema(description = "Unique identifier of the docking spot", example = "1")
    private Long id;

    @Schema(description = "Name of the docking spot", example = "Docking Spot A")
    private String name;

    @Schema(description = "Location of the docking spot", example = "Harbor Area 5")
    private String location;

    @Schema(description = "Description of the docking spot", example = "A premier docking spot with great amenities")
    private String description;

    @Schema(description = "Identifier of the owner of the docking spot", example = "2")
    private Long ownerId;

    @Schema(description = "Identifier of the port associated with the docking spot", example = "10")
    private Long portId;

    @Schema(description = "Services offered at the docking spot", example = "Refueling, repairs, storage")
    private String services;

    @Schema(description = "Pricing for the services offered", example = "100.50")
    private float servicesPricing;

    @Schema(description = "Price per night at the docking spot", example = "250.00")
    private float pricePerNight;

    @Schema(description = "Price per person for the docking spot", example = "35.00")
    private float pricePerPerson;


    // Default constructor
    public DockingSpotDto() {
    }

    // All-arguments constructor
    public DockingSpotDto(Long id, String name, String location, String description, Long ownerId, Long portId,
                          String services, float servicesPricing, float pricePerNight, float pricePerPerson, boolean availability) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.description = description;
        this.ownerId = ownerId;
        this.portId = portId;
        this.services = services;
        this.servicesPricing = servicesPricing;
        this.pricePerNight = pricePerNight;
        this.pricePerPerson = pricePerPerson;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Long getPortId() {
        return portId;
    }

    public void setPortId(Long portId) {
        this.portId = portId;
    }

    public String getServices() {
        return services;
    }

    public void setServices(String services) {
        this.services = services;
    }

    public float getServicesPricing() {
        return servicesPricing;
    }

    public void setServicesPricing(float servicesPricing) {
        this.servicesPricing = servicesPricing;
    }

    public float getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(float pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public float getPricePerPerson() {
        return pricePerPerson;
    }

    public void setPricePerPerson(float pricePerPerson) {
        this.pricePerPerson = pricePerPerson;
    }

}
