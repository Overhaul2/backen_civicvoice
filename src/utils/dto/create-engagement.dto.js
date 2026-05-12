class CreateEngagementDTO {

  constructor(data) {

    this.title = data.title;
    this.description = data.description;
    this.consultationId = data.consultationId;
    this.metadataURI = data.metadataURI;
  }

  validate() {

    const errors = [];

    if (!this.title || this.title.length < 3) {
      errors.push("Title invalide");
    }

    if (!this.description || this.description.length < 10) {
      errors.push("Description trop courte");
    }

    if (!this.consultationId) {
      errors.push("consultation requis");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = CreateEngagementDTO;