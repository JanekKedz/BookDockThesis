package pw.react.backend.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Data transfer object for Port")
public class PortDto {

    @Schema(description = "Unique identifier of the port", example = "1")
    private Long id;

    @Schema(description = "Name of the port", example = "Port A")
    private String name;

    @Schema(description = "Location of the port", example = "Coastal Area 3")
    private String location;

    @Schema(description = "Description of the port", example = "A large port with modern facilities")
    private String description;

    @Schema(description = "List of image IDs associated with the port", example = "[101, 102, 103]")
    private List<String> imageIds;

    @Schema(description = "ID of the owner of the port", example = "42")
    private Long ownerId;


    // Default constructor
    public PortDto() {
    }

    // All-arguments constructor
    public PortDto(Long id, String name, String location, String description, List<String> imageIds, Long ownerId) {
            this.id = id;
            this.name = name;
            this.location = location;
            this.description = description;
            this.imageIds = imageIds;
            this.ownerId = ownerId;
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

        public List<String> getImageIds() {
            return imageIds;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }

        public void setImageIds(List<String> imageIds) {
            this.imageIds = imageIds;
        }
    }
