
class SubmitVoteDTO {
    constructor(data) {
        this.optionId = data.optionId;
        this.consultationId = data.consultationId;
    }

    validate() {
        if (!this.optionId || typeof this.optionId !== 'string') {
            throw new Error("L'identifiant de l'option est requis");
        }
        if (!this.consultationId || typeof this.consultationId !== 'string') {
            throw new Error("L'identifiant de la consultation est requis");
        }
        
    }
}

module.exports = SubmitVoteDTO;