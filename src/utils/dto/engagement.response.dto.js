
class EngagementResponseDTO {

  constructor(entity) {

    this.id = entity.id;
    this.title = entity.title;
    this.description = entity.description;
    this.status = entity.status;

    this.consultationId = entity.consultationId;

    this.hashEngagement =
      entity.hashEngagement;

    this.txHash = entity.txHash;

    this.metadataURI =
      entity.metadataURI;

    this.createdAt =
      entity.createdAt;

    // relation sécurisée
    this.author = entity.author
      ? {
          id: entity.author.id,
          email: entity.author.email
        }
      : null;
  }
}

module.exports = EngagementResponseDTO;