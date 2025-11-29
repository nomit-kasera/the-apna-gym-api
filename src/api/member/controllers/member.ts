import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::member.member", ({ strapi }) => ({

    async stats(ctx) {

        // 1) Total published members
        const totalMembers = await strapi.db.query("api::member.member").count({
            where: { publishedAt: { $notNull: true } },
        });

        // 2) Active published members
        const activeMembers = await strapi.db.query("api::member.member").count({
            where: {
                is_active: true,
                publishedAt: { $notNull: true },
            },
        });

        // 3) Fetch *only* published members for revenue + expiry
        const members = await strapi.db.query("api::member.member").findMany({
            where: { publishedAt: { $notNull: true } },
        });

        const PRICES = {
            monthly: 999,
            quarterly: 3499,
            yearly: 9999,
        };

        // 4) Calculate revenue
        let monthlyRevenue = 0;
        members.forEach((m) => {
            monthlyRevenue += PRICES[m.membership_type] || 0;
        });

        // 5) Calculate expiring per month
        const expiringByMonth: Record<string, number> = {};

        members.forEach((m) => {
            const end = new Date(m.end_date);
            const month = end.toLocaleString("en-US", { month: "long" });

            expiringByMonth[month] = (expiringByMonth[month] || 0) + 1;
        });

        // 6) Membership Breakdown
        const membershipBreakdown = {
            monthly: 0,
            quarterly: 0,
            yearly: 0,
        };

        members.forEach((m) => {
            membershipBreakdown[m.membership_type] += 1;
        });

        // 7) Return full combined stats
        return {
            totalMembers,
            activeMembers,
            monthlyRevenue,
            expiringByMonth,
            membershipBreakdown,
        };
    },

    async latestRegistrations(ctx) {
        const latest = await strapi.db.query("api::member.member").findMany({
            where: { publishedAt: { $notNull: true } },
            orderBy: { createdAt: "desc" },
            limit: 3,
            select: ["id", "full_name", "membership_type", "createdAt"],
        });

        return latest;
    },

    async searchByPhone(ctx) {
        const phone = ctx.request.query.phone;

        if (!phone) {
            return ctx.badRequest("Phone number is required");
        }

        const member = await strapi.db.query("api::member.member").findOne({
            where: {
                phone_number: phone,
                publishedAt: { $notNull: true },
            },
        });

        if (!member) {
            return ctx.notFound("Member not found");
        }

        return member;
    }


}));
