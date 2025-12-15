package pw.react.backend.models.docks;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.Arrays;

import pw.react.backend.models.user.User;
import pw.react.backend.models.docks.DockingSpots;

import java.util.List;

@Entity
@Table(name = "ports") 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Port{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    private String description;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "image_ids")
    private String imageIdsStr = "";

    @Transient
    private List<String> imageIds = new ArrayList<>();

    // Convert string to list when entity is loaded
    @PostLoad
    private void onLoad() {
        if (imageIdsStr != null && !imageIdsStr.isEmpty()) {
            imageIds = new ArrayList<>(Arrays.asList(imageIdsStr.split(",")));
        }
    }

    // Convert list to string before saving
    @PrePersist
    @PreUpdate
    private void onSave() {
        if (imageIds != null && !imageIds.isEmpty()) {
            imageIdsStr = String.join(",", imageIds);
        } else {
            imageIdsStr = "";
        }
    }

    // Keep the same getter and setter for backward compatibility
    public List<String> getImageIds() {
        return imageIds;
    }

    public void setImageIds(List<String> imageIds) {
        this.imageIds = imageIds != null ? imageIds : new ArrayList<>();
    }

    private boolean isApproved;
}
