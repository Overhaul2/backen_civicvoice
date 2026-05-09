const ConsultationResponseDTO = (consultation) => {
  return {
    id: consultation.id,
    title: consultation.title,
    imageUrl: consultation.imageUrl,
    description: consultation.description,
    status: consultation.status,
    startAt: consultation.startAt,
    endAt: consultation.endAt,
    createdAt: consultation.createdAt,

    creator: consultation.creator
      ? {
          id: consultation.creator.id,
          email: consultation.creator.email,
        }
      : undefined,

    options: consultation.options,
  };
};

module.exports = ConsultationResponseDTO;