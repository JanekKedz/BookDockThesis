package pw.react.backend.models.docks;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "docking_spots")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DockingSpots {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String description;

    // Store the owner and port IDs directly, without a relation.
    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "port_id")
    private Long portId;

    private String services;
    private float servicesPricing;
    private float pricePerNight;
    private float pricePerPerson;

    // Method to get services as a list
    @Transient // Not persisted to database
    public List<String> getServicesList() {
        if (services == null || services.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(services.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    // Method to check if this spot has a specific service
    public boolean hasService(String service) {
        return getServicesList().contains(service);
    }

    // Method to set services from a list
    public void setServicesList(List<String> servicesList) {
        if (servicesList == null || servicesList.isEmpty()) {
            this.services = "";
        } else {
            this.services = String.join(",", servicesList);
        }
    }




}
