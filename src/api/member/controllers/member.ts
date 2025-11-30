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

        // 3) Fetch published members
        const members = await strapi.db.query("api::member.member").findMany({
            where: { publishedAt: { $notNull: true } },
        });

        // 🔥 Normalize membership values
        const normalize = (val) =>
            val?.toLowerCase().replace(/\s+/g, "") || "";

        // Pricing table
        const PRICES = {
            monthly: 1099,
            quarterly: 2699,
            halfyearly: 5099,
            yearly: 9999,
        };

        // 4) Calculate revenue
        let monthlyRevenue = 0;
        members.forEach((m) => {
            const key = normalize(m.membership_type);
            monthlyRevenue += PRICES[key] || 0;
        });

        // 5) Expiring per month
        const expiringByMonth = {};

        members.forEach((m) => {
            const end = new Date(m.end_date);
            const month = end.toLocaleString("en-US", { month: "long" });
            expiringByMonth[month] = (expiringByMonth[month] || 0) + 1;
        });

        // 6) Membership Breakdown (Safe)
        const membershipBreakdown = {
            monthly: 0,
            quarterly: 0,
            halfyearly: 0,
            yearly: 0,
        };

        members.forEach((m) => {
            const key = normalize(m.membership_type);
            if (membershipBreakdown[key] !== undefined) {
                membershipBreakdown[key] += 1;
            }
        });

        // 7) Return result
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
