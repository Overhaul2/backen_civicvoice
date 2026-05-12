
const EngagementResponseDTO =
  require("../dto/engagement.response.dto");

class EngagementMapper {

  static toDTO(entity) {

    return new EngagementResponseDTO(entity);
  }

  static toDTOList(entities) {

    return entities.map(
      e => new EngagementResponseDTO(e)
    );
  }
}

module.exports = EngagementMapper;