class UpdateConsultationDTO {
    constructor(data) {
        if (data.title !== undefined) {
            this.title = data.title;
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.imageUrl !== undefined) {
            this.imageUrl = data.imageUrl;
        }

        if (data.status !== undefined) {
            this.status = data.status;
        }

        if (data.startAt !== undefined) {
            this.startAt = data.startAt;
        }

        if (data.endAt !== undefined) {
            this.endAt = data.endAt;
        }

        // options de vote
        if (data.options !== undefined) {
            this.options = data.options;
        }
    }

    validate() {
        // Title
        if (
            this.title !== undefined &&
            (
                typeof this.title !== "string" ||
                this.title.trim() === ""
            )
        ) {
            throw new Error(
                "Le titre est invalide"
            );
        }

        // Description
        if (
            this.description !== undefined &&
            (
                typeof this.description !== "string" ||
                this.description.trim() === ""
            )
        ) {
            throw new Error(
                "La description est invalide"
            );
        }

        // Dates
        if (this.startAt !== undefined) {
            const startDate = new Date(this.startAt);

            if (isNaN(startDate.getTime())) {
                throw new Error(
                    "Date de début invalide"
                );
            }
        }

        if (this.endAt !== undefined) {
            const endDate = new Date(this.endAt);

            if (isNaN(endDate.getTime())) {
                throw new Error(
                    "Date de fin invalide"
                );
            }
        }

        // Vérification cohérence start/end
        if (
            this.startAt !== undefined &&
            this.endAt !== undefined
        ) {
            const startDate = new Date(this.startAt);
            const endDate = new Date(this.endAt);

            if (endDate <= startDate) {
                throw new Error(
                    "La date de fin doit être supérieure à la date de début"
                );
            }
        }

        // Options
        if (this.options !== undefined) {
            if (!Array.isArray(this.options)) {
                throw new Error(
                    "Les options doivent être un tableau"
                );
            }

            if (this.options.length < 2) {
                throw new Error(
                    "Une consultation doit contenir au moins 2 options"
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
        }

        return true;
    }
}

module.exports = UpdateConsultationDTO;