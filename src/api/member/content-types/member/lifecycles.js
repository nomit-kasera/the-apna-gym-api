module.exports = {
    beforeCreate(event) {
        const data = event.params.data;
        data.status = getStatus(data.start_date, data.end_date);
    },

    beforeUpdate(event) {
        const data = event.params.data;

        // fetch existing data if needed
        const existing = event.params.where.id
            ? strapi.entityService.findOne("api::member.member", event.params.where.id)
            : {};

        const startDate = data.start_date || existing.start_date;
        const endDate = data.end_date || existing.end_date;

        data.status = getStatus(startDate, endDate);
    },
};

function getStatus(startDate, endDate) {
    if (!startDate || !endDate) return "active";

    const today = new Date();
    const end = new Date(endDate);

    // Expired
    if (today > end) return "expired";

    // Days remaining
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 5) return "expiring_soon";

    return "active";
}
