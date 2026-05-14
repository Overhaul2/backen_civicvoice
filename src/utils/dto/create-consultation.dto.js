class CreateConsultationDTO {
    constructor(data) {
        this.title = data.title;
        this.imageUrl = data.imageUrl || null;
        this.description = data.description;
        this.status = data.status;
        this.startAt = data.startAt;
        this.endAt = data.endAt;
        this.createdAt = data.createdAt;

        // options de vote
        this.options = data.options || [];
    }

    validate() {
        // Title
        if (!this.title || this.title.trim() === "") {
            throw new Error("Le titre est obligatoire");
        }

        if (this.title.length < 3) {
            throw new Error(
                "Le titre doit contenir au moins 3 caractères"
            );
        }

        // Description
        if (!this.description || this.description.trim() === "") {
            throw new Error("La description est obligatoire");
        }

        // Dates
        if (!this.startAt) {
            throw new Error("La date de début est obligatoire");
        }

        if (!this.endAt) {
            throw new Error("La date de fin est obligatoire");
        }
        if (startDate < new Date()) {
            throw new Error("La date de début ne peut pas être dans le passé");
        }

        const startDate = new Date(this.startAt);
        const endDate = new Date(this.endAt);

        if (isNaN(startDate.getTime())) {
            throw new Error("Date de début invalide");
        }

        if (isNaN(endDate.getTime())) {
            throw new Error("Date de fin invalide");
        }

        if (endDate <= startDate) {
            throw new Error(
                "La date de fin doit être supérieure à la date de début"
            );
        }

        // Options
        if (!Array.isArray(this.options)) {
            throw new Error(
                "Les options doivent être un tableau"
            );
        }

        if (this.options.length < 2) {
            throw new Error(
                "Une consultation doit avoir au moins 2 options"
            );
        }

        for (const option of this.options) {
            if (
                !option.label ||
                option.label.trim() === ""
            ) {
                throw new Error(
                    "Chaque option doit avoir un label valide"
                );
            }
        }

        return true;
    }
}

module.exports = CreateConsultationDTO;