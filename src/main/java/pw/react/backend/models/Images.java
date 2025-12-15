package pw.react.backend.models;

import jakarta.persistence.*;

@Entity
public class Images {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "base64Image", columnDefinition = "MEDIUMTEXT")
    private String base64Image;

    // Default constructor
    public Images() {
    }

    // Constructor with base64Image parameter
    public Images(String base64Image) {
        this.base64Image = base64Image;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBase64Image() {
        return base64Image;
    }

    public void setBase64Image(String base64Image) {
        this.base64Image = base64Image;
    }

}