/**
 * member custom routes (Strapi v5)
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/member/stats",
      handler: 'api::member.member.stats',
    },
  ],
};
